import { vi } from "vitest";
import type { QueueView } from "../../shared/protocol/QueueView";
import type { RankedQueueBinding } from "../screens/lobby/RankedQueueBinding";

export const OUT_OF_QUEUE: QueueView = {
  counts: { total: 4, bySize: { 2: 1, 3: 2, 4: 1 } },
  own: { kind: "out", rejoinAt: null, dailyLimit: null },
  isSiteGameLimitReached: false,
};

export function testRankedQueue(changes: Partial<RankedQueueBinding> = {}): RankedQueueBinding {
  return {
    queue: null,
    notice: null,
    rejection: null,
    standingCheck: "",
    onIntent: vi.fn(),
    onResync: vi.fn(),
    onDismissNotice: vi.fn(),
    ...changes,
  };
}
