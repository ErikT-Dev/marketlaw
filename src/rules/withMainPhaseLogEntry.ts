import type { MainPhaseLogEntry } from "../shared/MainPhaseLogEntry";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { mainPhaseLogEntryOf } from "./mainPhaseLogEntryOf";
import type { SeatState } from "./SeatState";
import { updateSeat } from "./updateSeat";

function withRedrawCounted(seat: SeatState, turn: number): SeatState {
  const otherEntries = seat.logEntriesThisMainPhase.filter((entry) => entry.kind !== "redrew");
  const redrew: MainPhaseLogEntry = {
    kind: "redrew",
    turn,
    seat: seat.seat,
    times: seat.redrawsUsed,
  };
  return { ...seat, logEntriesThisMainPhase: [...otherEntries, redrew] };
}

export function withMainPhaseLogEntry(action: GameAction, after: GameState): GameState {
  if (action.type === "redraw_hand") {
    return updateSeat(after, action.seat, (seat) => withRedrawCounted(seat, after.turn));
  }
  const entry = mainPhaseLogEntryOf(action, after.turn);
  return entry === null
    ? after
    : updateSeat(after, action.seat, (seat) => ({
        ...seat,
        logEntriesThisMainPhase: [...seat.logEntriesThisMainPhase, entry],
      }));
}
