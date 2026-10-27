import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { StoredSession } from "./StoredSession";

export type ClientState = {
  readonly session: StoredSession | null;
  readonly connection: ConnectionStatus;
  readonly update: RoomUpdate | null;
  readonly pendingActionIds: ReadonlyArray<string>;
  readonly notice: string | null;
};
