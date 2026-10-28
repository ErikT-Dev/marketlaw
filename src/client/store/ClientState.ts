import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { PendingAction } from "./PendingAction";
import type { RejectedMove } from "./RejectedMove";
import type { StoredSession } from "./StoredSession";

export type ClientState = {
  readonly session: StoredSession | null;
  readonly connection: ConnectionStatus;
  readonly update: RoomUpdate | null;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly notice: string | null;
};
