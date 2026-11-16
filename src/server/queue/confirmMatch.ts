import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { openMatchOf } from "./openMatchOf";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";
import { startConfirmedMatch } from "./startConfirmedMatch";

export function confirmMatch(
  state: QueueState,
  playerId: PlayerId,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  const match = openMatchOf(state.queue, playerId, context.now);
  if (match === undefined) {
    return { isOk: false, error: "no_match_to_confirm" };
  }
  const confirmedMatch = match.confirmed.includes(playerId)
    ? match
    : { ...match, confirmed: [...match.confirmed, playerId] };
  if (confirmedMatch.confirmed.length === match.players.length) {
    return { isOk: true, value: startConfirmedMatch(state, match, context) };
  }
  const matches = state.queue.matches.map((other) => (other === match ? confirmedMatch : other));
  return {
    isOk: true,
    value: { ...state, queue: { ...state.queue, matches }, notices: [], starts: [] },
  };
}
