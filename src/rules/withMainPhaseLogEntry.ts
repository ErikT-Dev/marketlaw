import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { mainPhaseLogEntryOf } from "./mainPhaseLogEntryOf";
import { updateSeat } from "./updateSeat";

export function withMainPhaseLogEntry(action: GameAction, after: GameState): GameState {
  const entry = mainPhaseLogEntryOf(action, after.turn);
  return entry === null
    ? after
    : updateSeat(after, action.seat, (seat) => ({
        ...seat,
        logEntriesThisMainPhase: [...seat.logEntriesThisMainPhase, entry],
      }));
}
