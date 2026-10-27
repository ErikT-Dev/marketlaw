import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomCode } from "../../shared/RoomCode";
import { requestGuest } from "../api/requestGuest";
import { requestRoom } from "../api/requestRoom";
import type { ClientState } from "./ClientState";
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
      pendingActionIds: [],
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
    const actionId = this.host?.sendAction(action);
    if (actionId !== undefined) {
      this.change({ pendingActionIds: [...this.state.pendingActionIds, actionId], notice: null });
    }
  };

  private async openRoom(path: string, body: unknown): Promise<void> {
    const session = this.state.session;
    if (session === null) {
      return;
    }
    const response = await requestRoom(path, body, session.token);
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
        this.change({ connection: event.status });
        return;
      case "update":
        this.change({
          update: event.update,
          pendingActionIds: this.state.pendingActionIds.filter(
            (id) => id !== event.acceptedActionId,
          ),
        });
        return;
      case "rejected":
        this.change({
          pendingActionIds: this.state.pendingActionIds.filter((id) => id !== event.actionId),
          notice: `That was not allowed (${event.code}).`,
        });
        return;
    }
  };

  private change(changes: Partial<ClientState>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
