import { matchQueue } from "./matchQueue";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import { withClosedConnectionsLeft } from "./withClosedConnectionsLeft";

export function rematched(change: QueueChange, context: QueueContext): QueueChange {
  const left = withClosedConnectionsLeft(change, context.now);
  const matched = matchQueue(left, context);
  return {
    ...matched,
    notices: [...left.notices, ...matched.notices],
    starts: [...left.starts, ...matched.starts],
  };
}
