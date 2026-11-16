import type { ReasonCode } from "../ReasonCode";
import type { QueueNotice } from "./QueueNotice";
import type { QueueView } from "./QueueView";

export type QueueServerMessage =
  | { readonly type: "queue"; readonly protocolVersion: number; readonly queue: QueueView }
  | {
      readonly type: "queue_notice";
      readonly protocolVersion: number;
      readonly notice: QueueNotice;
    }
  | {
      readonly type: "queue_rejected";
      readonly protocolVersion: number;
      readonly code: ReasonCode;
    };
