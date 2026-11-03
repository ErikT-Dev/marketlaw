import { vi } from "vitest";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";

export function gamePageProps(
  update: RoomUpdate,
  pendingActions: ReadonlyArray<PendingAction> = [],
  rejectedMove: RejectedMove | null = null,
) {
  return {
    update,
    pendingActions,
    rejectedMove,
    onAction: vi.fn(),
    onDismissRejection: vi.fn(),
    serverClockOffsetMs: 0,
    timeOutNotice: null,
    onDismissTimeOutNotice: vi.fn(),
    onExitToLobby: vi.fn(),
    connection: "open" as const,
    isOutdated: false,
    onPlayHere: vi.fn(),
  };
}
