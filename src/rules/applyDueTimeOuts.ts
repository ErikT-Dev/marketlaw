import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import { pausedAbandonDeadline } from "./pausedAbandonDeadline";
import type { Random } from "./Random";
import type { SavedGame } from "./SavedGame";

function closedIfVoteDue(
  saved: SavedGame,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): SavedGame {
  const { vote } = saved.state;
  if (vote === null || vote.deadline > at) {
    return saved;
  }
  const close = { type: "close_vote", seat: vote.caller } as const;
  const result = applyToSavedGame(saved, close, at, randomFor(saved));
  return result.isOk ? result.value : saved;
}

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
  return abandonedIfPausedTooLong(closedIfVoteDue(timedOut, at, randomFor), at, randomFor);
}
