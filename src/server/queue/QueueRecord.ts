import type { ClosedConnection } from "./ClosedConnection";
import type { QueueEntry } from "./QueueEntry";
import type { QueueMatch } from "./QueueMatch";
import type { RejoinWait } from "./RejoinWait";

export type QueueRecord = {
  readonly entries: ReadonlyArray<QueueEntry>;
  readonly matches: ReadonlyArray<QueueMatch>;
  readonly rejoinWaits: ReadonlyArray<RejoinWait>;
  readonly closedConnections: ReadonlyArray<ClosedConnection>;
};
