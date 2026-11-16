import type { QueueNoticeTo } from "./QueueNoticeTo";
import type { QueueState } from "./QueueState";

export type QueueChange = QueueState & {
  readonly notices: ReadonlyArray<QueueNoticeTo>;
};
