import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { gameSizesOf } from "./gameSizesOf";
import { matchQueue } from "./matchQueue";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueEntry } from "./QueueEntry";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";

function withSizesOf(
  entries: ReadonlyArray<QueueEntry>,
  changed: QueueEntry,
): ReadonlyArray<QueueEntry> {
  return entries.map((entry) => (entry.playerId === changed.playerId ? changed : entry));
}

function isConfirming(state: QueueState, playerId: PlayerId): boolean {
  return state.queue.matches.some(({ players }) =>
    players.some((entry) => entry.playerId === playerId),
  );
}

export function changeQueueSizes(
  state: QueueState,
  playerId: PlayerId,
  requestedSizes: ReadonlyArray<number>,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  const sizes = gameSizesOf(requestedSizes);
  if (!sizes.isOk) {
    return sizes;
  }
  const changed: QueueEntry = { playerId, sizes: sizes.value };
  const { queue } = state;
  if (queue.entries.some((entry) => entry.playerId === playerId)) {
    const entries = withSizesOf(queue.entries, changed);
    return { isOk: true, value: matchQueue({ ...state, queue: { ...queue, entries } }, context) };
  }
  if (!isConfirming(state, playerId)) {
    return { isOk: false, error: "not_in_queue" };
  }
  const matches = queue.matches.map((match) => ({
    ...match,
    players: withSizesOf(match.players, changed),
  }));
  return { isOk: true, value: { ...state, queue: { ...queue, matches }, notices: [] } };
}
