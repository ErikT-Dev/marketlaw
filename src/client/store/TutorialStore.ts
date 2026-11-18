import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import type { OpenLobbyFeed } from "../../shared/OpenLobbyFeed";
import type { OpenQueueFeed } from "../../shared/OpenQueueFeed";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import { requestTutorialStart } from "../api/requestTutorialStart";
import type { ClientState } from "./ClientState";
import { CODES_THAT_RELOAD_THE_GAME } from "./CODES_THAT_RELOAD_THE_GAME";
import { LobbyFeedStore } from "./LobbyFeedStore";
import type { OpenTutorialHost } from "./OpenTutorialHost";
import type { StoredSession } from "./StoredSession";

const NOT_CONNECTED = "Not connected to the tutorial. Try again in a moment.";

export abstract class TutorialStore extends LobbyFeedStore {
  private tutorialHost: GameHost | null = null;
  private readonly openTutorialHost: OpenTutorialHost;

  constructor(
    initial: ClientState,
    openLobby: OpenLobbyFeed,
    openQueue: OpenQueueFeed,
    openTutorialHost: OpenTutorialHost,
  ) {
    super(initial, openLobby, openQueue);
    this.openTutorialHost = openTutorialHost;
  }

  readonly startTutorial = (): void => {
    const session = this.state.session;
    if (session !== null) {
      void this.requestTutorial(session);
    }
  };

  readonly dismissTutorialRefusal = (): void => {
    this.change({ tutorialRefusal: null });
  };

  readonly sendTutorialMove = (action: ActionIntent): void => {
    const actionId = this.tutorialHost?.sendAction(action) ?? null;
    if (actionId === null) {
      this.change({ notice: NOT_CONNECTED });
      return;
    }
    this.change({
      pendingActions: [...this.state.pendingActions, { id: actionId, action }],
      rejectedMove: null,
      notice: null,
    });
  };

  readonly continueTutorial = (): void => {
    this.sendTutorialIntent("continue");
  };

  readonly restartTutorial = (): void => {
    this.sendTutorialIntent("restart_tutorial");
  };

  readonly leaveTutorial = (): void => {
    this.sendTutorialIntent("leave_tutorial");
  };

  readonly playTutorialHere = (): void => {
    const session = this.state.session;
    if (session?.isInTutorial === true) {
      this.enterTutorial(session);
    }
  };

  protected enterTutorial(session: StoredSession): void {
    const player = session.playerId;
    if (player === null) {
      this.leaveRoom(NOT_CONNECTED, { ...session, roomCode: null, isInTutorial: false });
      return;
    }
    this.stopWatchingQueue();
    this.closeTutorial();
    this.tutorialHost = this.openTutorialHost(player, session.token);
    this.tutorialHost.subscribe(this.receiveTutorialEvent);
  }

  protected closeTutorial(): void {
    this.tutorialHost?.close();
    this.tutorialHost = null;
  }

  private async requestTutorial(session: StoredSession): Promise<void> {
    const answer = await requestTutorialStart(session.token);
    if (!answer.isOk) {
      this.change({ tutorialRefusal: answer.reason });
      return;
    }
    const current = this.state.session;
    if (current?.token !== session.token) {
      return;
    }
    const inTutorial = { ...current, roomCode: null, isInTutorial: true };
    this.leaveRoom(null, inTutorial);
    this.change({ tutorialRefusal: null, removal: null, joinError: null });
    this.enterTutorial(inTutorial);
  }

  private sendTutorialIntent(type: "continue" | "restart_tutorial" | "leave_tutorial"): void {
    const actionId = this.tutorialHost?.sendTutorialAction({ type }) ?? null;
    this.change(
      actionId === null ? { notice: NOT_CONNECTED } : { rejectedMove: null, notice: null },
    );
  }

  private readonly receiveTutorialEvent = (event: HostEvent): void => {
    switch (event.type) {
      case "connection":
        this.receiveTutorialConnection(event.status);
        return;
      case "tutorial_update":
        this.change({
          tutorial: event.view,
          tutorialPlayerIconColor: event.playerIconColor,
          pendingActions: this.state.pendingActions.filter(
            (pending) => pending.id !== event.acceptedActionId,
          ),
          serverClockOffsetMs: event.serverNow - Date.now(),
        });
        return;
      case "rejected":
        this.receiveTutorialRejection(event);
        return;
      case "removed":
        this.leaveRoom(null, this.sessionOutsideTutorial());
        return;
      case "update":
      case "notice":
      case "chat":
        return;
    }
  };

  private receiveTutorialConnection(status: ConnectionStatus): void {
    if (status === "logged_out") {
      this.leaveRoom("You logged out.", null);
      return;
    }
    if (status === "room_gone") {
      this.leaveRoom(null, this.sessionOutsideTutorial());
      return;
    }
    this.change({
      connection: status,
      pendingActions: status === "closed" ? [] : this.state.pendingActions,
    });
  }

  private receiveTutorialRejection(
    rejection: Extract<HostEvent, { readonly type: "rejected" }>,
  ): void {
    const { code, actionId } = rejection;
    if (code === "wrong_protocol_version") {
      this.change({ isOutdated: true });
      return;
    }
    if (code === "invalid_token") {
      this.leaveRoom("Your guest session has ended. Enter your name again.", null);
      return;
    }
    if (CODES_THAT_RELOAD_THE_GAME.includes(code)) {
      this.tutorialHost?.requestResync();
    }
    const rejected = this.state.pendingActions.find((pending) => pending.id === actionId);
    this.change({
      pendingActions: this.state.pendingActions.filter((pending) => pending.id !== actionId),
      rejectedMove: code === "stale_state" ? null : { action: rejected?.action ?? null, code },
    });
  }

  private sessionOutsideTutorial(): StoredSession | null {
    const session = this.state.session;
    return session === null ? null : { ...session, roomCode: null, isInTutorial: false };
  }
}
