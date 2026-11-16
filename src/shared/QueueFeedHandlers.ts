import type { EpochMs } from "./EpochMs";
import type { QueueNotice } from "./protocol/QueueNotice";
import type { QueueView } from "./protocol/QueueView";
import type { ReasonCode } from "./ReasonCode";

export type QueueFeedHandlers = {
  readonly onOpen: () => void;
  readonly onView: (view: QueueView, serverNow: EpochMs) => void;
  readonly onNotice: (notice: QueueNotice) => void;
  readonly onRejected: (code: ReasonCode) => void;
};
