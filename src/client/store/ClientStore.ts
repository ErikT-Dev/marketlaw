import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { GameHost } from "../../shared/GameHost";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { HostEvent } from "../../shared/HostEvent";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomCode } from "../../shared/RoomCode";
import { requestGuest } from "../api/requestGuest";
import { requestRoom } from "../api/requestRoom";
import type { ClientState } from "./ClientState";
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

  constructor(openHost: OpenHost) {
    this.openHost = openHost;
    const session = readSession();
    this.state = {
      session,
      connection: "closed",
      update: null,
      pendingActions: [],
      rejectedMove: null,
      notice: null,
    };
    if (session?.roomCode !== null && session !== null) {
      this.enterRoom(session, session.roomCode);
    }
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((known) => known !== listener);
    };
  };

  readonly getSnapshot = (): ClientState => this.state;

  readonly startAsGuest = async (name: string): Promise<void> => {
    const guest = await requestGuest(name);
    if (guest === null) {
      this.change({ notice: "That name cannot be used. Use 1 to 20 characters." });
      return;
    }
    const session = { token: guest.token, name: guest.name, roomCode: null };
    writeSession(session);
    this.change({ session, notice: null });
  };

  readonly createRoom = async (size: 2 | 3 | 4): Promise<void> => {
    await this.openRoom("/api/rooms", { size });
  };

  readonly joinRoom = async (code: string): Promise<void> => {
    await this.openRoom(`/api/rooms/${code.trim().toUpperCase()}/join`, {});
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

  private leaveRoom(notice: string, session: StoredSession | null): void {
    this.host?.close();
    this.host = null;
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

  private async openRoom(path: string, body: Readonly<Record<string, unknown>>): Promise<void> {
    const session = this.state.session;
    if (session === null) {
      return;
    }
    const response = await requestRoom(path, { ...body, token: session.token });
    if (!response.isOk) {
      this.change({ notice: `The room could not be opened (${response.reason}).` });
      return;
    }
    this.enterRoom(session, response.code);
  }

  private enterRoom(session: StoredSession, code: RoomCode): void {
    const inRoom = { ...session, roomCode: code };
    writeSession(inRoom);
    this.change({ session: inRoom, notice: null });
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
        });
        return;
      case "rejected":
        this.receiveRejection(event.code, event.actionId);
        return;
    }
  };

  private receiveConnection(status: ConnectionStatus): void {
    if (status === "room_gone") {
      this.leaveRoom("That room no longer exists.", this.sessionOutsideRooms());
      return;
    }
    this.change({
      connection: status,
      pendingActions: status === "closed" ? [] : this.state.pendingActions,
    });
  }

  private receiveRejection(code: ReasonCode, actionId: string | null): void {
    if (code === "invalid_token") {
      this.leaveRoom("Your guest session has ended. Enter your name again.", null);
      return;
    }
    if (code === "not_in_game" && actionId === null) {
      this.leaveRoom("You are not in that room.", this.sessionOutsideRooms());
      return;
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
