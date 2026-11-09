import { vi } from "vitest";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";
import { NO_ROOM_CHAT } from "../store/NO_ROOM_CHAT";
import { testAccount } from "./testAccount";

export function gamePageProps(
  update: RoomUpdate,
  pendingActions: ReadonlyArray<PendingAction> = [],
  rejectedMove: RejectedMove | null = null,
) {
  return {
    update,
    chat: {
      chat: NO_ROOM_CHAT,
      onSend: vi.fn(),
      onMute: vi.fn(),
      onUnmute: vi.fn(),
      onSeen: vi.fn(),
    },
    account: testAccount(),
    pendingActions,
    rejectedMove,
    onAction: vi.fn(),
    onDismissRejection: vi.fn(),
    serverClockOffsetMs: 0,
    timeOutNotice: null,
    onDismissTimeOutNotice: vi.fn(),
    onExitToLobby: vi.fn(),
    onCloseResult: vi.fn(),
    onAskRematch: null,
    connection: "open" as const,
    isOutdated: false,
    onPlayHere: vi.fn(),
  };
}
