import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { GameHost } from "../../shared/GameHost";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { HostEvent } from "../../shared/HostEvent";
import type { LobbyFeed } from "../../shared/LobbyFeed";
import type { OpenLobbyFeed } from "../../shared/OpenLobbyFeed";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomCode } from "../../shared/RoomCode";
import { requestRoom } from "../api/requestRoom";
import type { EpochMs } from "../../shared/EpochMs";
import type { RemovalReason } from "../../shared/protocol/RemovalReason";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { NewRoom } from "./NewRoom";
import { requestTestSeat } from "../api/requestTestSeat";
import { EmailAccountStore } from "./EmailAccountStore";
import { chatAfterRefusal } from "./chatAfterRefusal";
import { chatAfterSending } from "./chatAfterSending";
import { CODES_THAT_RELOAD_THE_GAME } from "./CODES_THAT_RELOAD_THE_GAME";
import { initialClientState } from "./initialClientState";
import { NO_ROOM_CHAT } from "./NO_ROOM_CHAT";
import type { PendingAction } from "./PendingAction";
import { readSession } from "./readSession";
import { roomChatAfter } from "./roomChatAfter";
import type { StoredSession } from "./StoredSession";
import { writeSession } from "./writeSession";

type OpenHost = (code: RoomCode, token: string) => GameHost;

export class ClientStore extends EmailAccountStore {
  private host: GameHost | null = null;
  private readonly openHost: OpenHost;
  private readonly openLobby: OpenLobbyFeed;
  private lobbyFeed: LobbyFeed | null = null;

  constructor(openHost: OpenHost, openLobby: OpenLobbyFeed = () => ({ close: () => undefined })) {
    super(initialClientState(readSession()));
    this.openHost = openHost;
    this.openLobby = openLobby;
    const session = this.state.session;
    if (session !== null) {
      void this.checkSession(session);
    }
    if (session?.roomCode !== null && session !== null) {
      this.enterRoom(session, session.roomCode);
    } else {
      this.watchLobby();
    }
  }

  private watchLobby(): void {
    this.lobbyFeed ??= this.openLobby((publicRooms) => {
      this.change({ publicRooms });
    });
  }

  readonly startFromSeatLink = async (
    linked: StoredSession,
    askToSwitch: () => boolean,
  ): Promise<void> => {
    if (!(await requestTestSeat(linked.token))) {
      this.change({ notice: "That link is not a test room seat, so it was ignored." });
      return;
    }
    const current = this.state.session;
    if (current !== null && current.token !== linked.token && !askToSwitch()) {
      return;
    }
    if (linked.roomCode === null) {
      return;
    }
    this.enterRoom(linked, linked.roomCode);
    await this.checkSession(linked);
  };

  readonly createRoom = async (room: NewRoom): Promise<ReasonCode | null> => {
    const session = this.state.session;
    if (session === null) {
      return "invalid_token";
    }
    const response = await requestRoom("/api/rooms", { ...room, token: session.token });
    if (response.isOk) {
      this.enterRoom(session, response.code);
    }
    return response.isOk ? null : response.reason;
  };

  readonly joinRoom = async (typed: string): Promise<void> => {
    const session = this.state.session;
    const code = typed.trim().toUpperCase();
    if (session === null) {
      return;
    }
    const response = /^[A-Z0-9]{6}$/.test(code)
      ? await requestRoom(`/api/rooms/${code}/join`, { token: session.token })
      : { isOk: false as const, reason: "room_not_found" as const, rejoinAt: null };
    if (!response.isOk) {
      this.change({ joinError: { code, reason: response.reason, rejoinAt: response.rejoinAt } });
      return;
    }
    this.enterRoom(session, response.code);
  };

  readonly sendRoomAction = (action: RoomIntent): void => {
    if (this.host?.sendRoomAction(action) !== true) {
      this.change({ notice: "Not connected to the room. Try again in a moment." });
    } else if (action.type === "send_chat") {
      this.change({ chat: chatAfterSending(this.state.chat, action.text) });
    }
  };

  readonly leaveWaitingRoom = (): void => {
    this.host?.sendRoomAction({ type: "leave_room" });
    this.leaveRoom(null, this.sessionOutsideRooms());
  };

  readonly dismissRemoval = (): void => {
    this.change({ removal: null, goneRoomCode: null });
  };

  readonly sendAction = (action: ActionIntent): void => {
    const actionId = this.host?.sendAction(action) ?? null;
    if (actionId === null) {
      this.change({ notice: "Not connected to the room. Try again in a moment." });
      return;
    }
    this.change({
      pendingActions: [...this.state.pendingActions, { id: actionId, action }],
      rejectedMove: null,
      notice: null,
    });
  };

  readonly dismissRejection = (): void => {
    this.change({ rejectedMove: null });
  };

  readonly exitToLobby = (): void => {
    this.host?.sendRoomAction({ type: "leave_room" });
    this.leaveRoom(null, this.sessionOutsideRooms());
  };

  protected override leaveRoom(notice: string | null, session: StoredSession | null): void {
    this.host?.close();
    this.host = null;
    this.watchLobby();
    writeSession(session);
    this.change({
      session,
      update: null,
      chat: NO_ROOM_CHAT,
      pendingActions: [],
      rejectedMove: null,
      notice,
      connection: "closed",
    });
  }

  readonly markChatRead = (): void => {
    if (this.state.chat.unreadCount > 0) {
      this.change({ chat: { ...this.state.chat, unreadCount: 0 } });
    }
  };

  readonly dismissTimeOutNotice = (): void => {
    this.change({ timeOutNotice: null });
  };

  private enterRoom(session: StoredSession, code: RoomCode): void {
    const inRoom = { ...session, roomCode: code };
    writeSession(inRoom);
    this.change({
      session: inRoom,
      chat: NO_ROOM_CHAT,
      notice: null,
      joinError: null,
      removal: null,
    });
    this.lobbyFeed?.close();
    this.lobbyFeed = null;
    this.host?.close();
    this.host = this.openHost(code, session.token);
    this.host.subscribe(this.receive);
  }

  private readonly receive = (event: HostEvent): void => {
    switch (event.type) {
      case "connection":
        this.receiveConnection(event.status);
        return;
      case "update":
        this.change({
          update: event.update,
          pendingActions: this.withoutPending(event.acceptedActionId),
          serverClockOffsetMs: event.serverNow - Date.now(),
        });
        return;
      case "notice":
        this.change({ timeOutNotice: event.notice });
        return;
      case "chat":
        this.change({ chat: roomChatAfter(this.state.chat, event) });
        return;
      case "rejected":
        this.receiveRejection(event);
        return;
      case "removed":
        this.receiveRemoval(event.reason, event.rejoinAt);
        return;
    }
  };

  private receiveRemoval(reason: RemovalReason, rejoinAt: EpochMs | null): void {
    const code = this.state.session?.roomCode ?? "";
    this.leaveRoom(null, this.sessionOutsideRooms());
    this.change({ removal: reason === "left" ? null : { code, reason, rejoinAt } });
  }

  private receiveConnection(status: ConnectionStatus): void {
    if (status === "logged_out") {
      this.leaveRoom("You logged out.", null);
      return;
    }
    if (status === "room_gone") {
      const goneRoomCode = this.state.session?.roomCode ?? null;
      this.leaveRoom(null, this.sessionOutsideRooms());
      this.change({ goneRoomCode });
      return;
    }
    this.change({
      connection: status,
      pendingActions: status === "closed" ? [] : this.state.pendingActions,
    });
  }

  readonly playHere = (): void => {
    const session = this.state.session;
    if (session?.roomCode !== null && session !== null) {
      this.enterRoom(session, session.roomCode);
    }
  };

  private receiveRejection(rejection: Extract<HostEvent, { readonly type: "rejected" }>): void {
    const { code, actionId, sendAgainAt } = rejection;
    const refusedChat = chatAfterRefusal(this.state.chat, code, sendAgainAt);
    if (refusedChat !== null) {
      this.change({ chat: refusedChat });
      return;
    }
    if (code === "wrong_protocol_version") {
      this.change({ isOutdated: true });
      return;
    }
    if (code === "invalid_token") {
      this.leaveRoom("Your guest session has ended. Enter your name again.", null);
      return;
    }
    if (code === "not_in_game" && actionId === null) {
      this.leaveRoom("You are not in that room.", this.sessionOutsideRooms());
      return;
    }
    if (CODES_THAT_RELOAD_THE_GAME.includes(code)) {
      this.host?.requestResync();
    }
    const rejected = this.state.pendingActions.find((pending) => pending.id === actionId);
    this.change({
      pendingActions: this.withoutPending(actionId),
      rejectedMove: code === "stale_state" ? null : { action: rejected?.action ?? null, code },
    });
  }

  private withoutPending(actionId: string | null): ReadonlyArray<PendingAction> {
    return this.state.pendingActions.filter((pending) => pending.id !== actionId);
  }

  private sessionOutsideRooms(): StoredSession | null {
    const session = this.state.session;
    return session === null ? null : { ...session, roomCode: null };
  }
}
