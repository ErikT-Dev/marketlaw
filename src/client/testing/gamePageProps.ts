import { vi } from "vitest";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";
import { NO_ROOM_CHAT } from "../store/NO_ROOM_CHAT";

export function gamePageProps(
  update: RoomUpdate,
  pendingActions: ReadonlyArray<PendingAction> = [],
  rejectedMove: RejectedMove | null = null,
) {
  return {
    update,
    chat: { chat: NO_ROOM_CHAT, onSend: vi.fn(), onMute: vi.fn(), onSeen: vi.fn() },
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
