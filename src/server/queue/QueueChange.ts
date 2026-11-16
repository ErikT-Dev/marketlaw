import type { QueueNoticeTo } from "./QueueNoticeTo";
import type { QueueState } from "./QueueState";
import type { RankedStart } from "./RankedStart";

export type QueueChange = QueueState & {
  readonly notices: ReadonlyArray<QueueNoticeTo>;
  readonly starts: ReadonlyArray<RankedStart>;
};
