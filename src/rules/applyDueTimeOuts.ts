import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import { pausedAbandonDeadline } from "./pausedAbandonDeadline";
import type { Random } from "./Random";
import type { SavedGame } from "./SavedGame";

function abandonedIfPausedTooLong(
  saved: SavedGame,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): SavedGame {
  const { state } = saved;
  const deadline = pausedAbandonDeadline(state);
  if (state.pause === null || deadline === null || deadline > at) {
    return saved;
  }
  const seat = state.pause.seats[0] ?? state.firstPlayer;
  const result = applyToSavedGame(saved, { type: "abandon_game", seat }, at, randomFor(saved));
  return result.isOk ? result.value : saved;
}

export function applyDueTimeOuts(
  saved: SavedGame,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): SavedGame {
  const timedOut = dueTimeOuts(saved.state, at).reduce((current, seat) => {
    const result = applyToSavedGame(current, { type: "time_out", seat }, at, randomFor(current));
    return result.isOk ? result.value : current;
  }, saved);
  return abandonedIfPausedTooLong(timedOut, at, randomFor);
}
