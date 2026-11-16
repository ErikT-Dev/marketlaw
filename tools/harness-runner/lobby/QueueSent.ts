import type { QueueNotice } from "../../../src/shared/protocol/QueueNotice.ts";
import type { QueueView } from "../../../src/shared/protocol/QueueView.ts";

export type QueueSent = {
  readonly notices: ReadonlyArray<QueueNotice>;
  readonly view: QueueView;
  readonly memberIds: ReadonlyArray<string>;
};
