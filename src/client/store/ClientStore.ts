import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { GameHost } from "../../shared/GameHost";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { HostEvent } from "../../shared/HostEvent";
import type { LobbyFeed } from "../../shared/LobbyFeed";
import type { OpenLobbyFeed } from "../../shared/OpenLobbyFeed";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomCode } from "../../shared/RoomCode";
import { requestGuest } from "../api/requestGuest";
import { requestRoom } from "../api/requestRoom";
import { requestSession } from "../api/requestSession";
import type { EpochMs } from "../../shared/EpochMs";
import type { RemovalReason } from "../../shared/protocol/RemovalReason";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { NewRoom } from "./NewRoom";
import { requestTestSeat } from "../api/requestTestSeat";
import type { ClientState } from "./ClientState";
import { CODES_THAT_RELOAD_THE_GAME } from "./CODES_THAT_RELOAD_THE_GAME";
import type { PendingAction } from "./PendingAction";
import { readSession } from "./readSession";
import type { StoredSession } from "./StoredSession";
import { writeSession } from "./writeSession";

type OpenHost = (code: RoomCode, token: string) => GameHost;

export class ClientStore {
  private state: ClientState;
  private listeners: ReadonlyArray<() => void> = [];
  private host: GameHost | null = null;
  private readonly openHost: OpenHost;
  private readonly openLobby: OpenLobbyFeed;
  private lobbyFeed: LobbyFeed | null = null;

  constructor(openHost: OpenHost, openLobby: OpenLobbyFeed = () => ({ close: () => undefined })) {
    this.openHost = openHost;
    this.openLobby = openLobby;
    const session = readSession();
    this.state = {
      session,
      connection: "closed",
      update: null,
      pendingActions: [],
      rejectedMove: null,
      notice: null,
      timeOutNotice: null,
      serverClockOffsetMs: 0,
      joinError: null,
      removal: null,
      goneRoomCode: null,
      publicRooms: [],
      isOutdated: false,
    };
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

  private async checkSession(session: StoredSession): Promise<void> {
    const answer = await requestSession(session.token);
    if (answer?.isLoggedIn === false && this.state.session?.token === session.token) {
      this.leaveRoom("Your login has ended. Choose a username to play again.", null);
    }
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((known) => known !== listener);
    };
  };

  readonly getSnapshot = (): ClientState => this.state;

  readonly startAsGuest = async (name: string, humanCheck: string): Promise<ReasonCode | null> => {
    const guest = await requestGuest(name, humanCheck);
    if (!guest.isOk) {
      return guest.reason;
    }
    const session = { token: guest.token, name: guest.name, roomCode: null };
    writeSession(session);
    this.change({ session, notice: null });
    return null;
  };

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

  private leaveRoom(notice: string | null, session: StoredSession | null): void {
    this.host?.close();
    this.host = null;
    this.watchLobby();
    writeSession(session);
    this.change({
      session,
      update: null,
      pendingActions: [],
      rejectedMove: null,
      notice,
      connection: "closed",
    });
  }

  readonly dismissTimeOutNotice = (): void => {
    this.change({ timeOutNotice: null });
  };

  private enterRoom(session: StoredSession, code: RoomCode): void {
    const inRoom = { ...session, roomCode: code };
    writeSession(inRoom);
    this.change({ session: inRoom, notice: null, joinError: null, removal: null });
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
      case "rejected":
        this.receiveRejection(event.code, event.actionId);
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

  private receiveRejection(code: ReasonCode, actionId: string | null): void {
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

  private change(changes: Partial<ClientState>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
