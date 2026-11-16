import type { OwnQueueState } from "./OwnQueueState";
import type { QueueCounts } from "./QueueCounts";

export type QueueView = {
  readonly counts: QueueCounts;
  readonly own: OwnQueueState;
  readonly isSiteGameLimitReached: boolean;
};
