import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameState } from "./GameState";

export function pauseGame(state: GameState, at: number): GameState {
  const due = dueTimeOuts(state, at);
  return {
    ...state,
    seats: state.seats.map((seat) => {
      const clock = due.includes(seat.seat) ? decisionClockOf(state, seat.seat) : null;
      return clock === null ? seat : { ...seat, timeBankMs: bankLeftAt(clock, at) };
    }),
    pause: { at, seats: due },
  };
}
