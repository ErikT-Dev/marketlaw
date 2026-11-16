import type { PlayerId } from "../../shared/PlayerId";
import type { OwnQueueState } from "../../shared/protocol/OwnQueueState";
import type { QueueRecord } from "./QueueRecord";

export function ownQueueStateOf(queue: QueueRecord, playerId: PlayerId | null): OwnQueueState {
  const waiting = queue.entries.find((entry) => entry.playerId === playerId);
  if (waiting !== undefined) {
    return { kind: "waiting", sizes: waiting.sizes };
  }
  const match = queue.matches.find(({ players }) =>
    players.some((entry) => entry.playerId === playerId),
  );
  return match === undefined
    ? { kind: "out" }
    : { kind: "confirming", size: match.size, deadline: match.deadline };
}
