import type { SeatNumber } from "../shared/SeatNumber";
import { decisionClockOf } from "./decisionClockOf";
import type { GameState } from "./GameState";
import { playerOrderOf } from "./playerOrderOf";

export function dueTimeOuts(state: GameState, at: number): ReadonlyArray<SeatNumber> {
  return playerOrderOf(state).filter((seat) => {
    const clock = decisionClockOf(state, seat);
    return clock !== null && clock.deadline <= at;
  });
}
