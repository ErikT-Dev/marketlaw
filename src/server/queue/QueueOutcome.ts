import type { QueueChange } from "./QueueChange";
import type { QueueRejection } from "./QueueRejection";

export type QueueOutcome = {
  readonly change: QueueChange;
  readonly rejection: QueueRejection | null;
};
