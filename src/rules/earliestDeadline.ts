import { decisionClockOf } from "./decisionClockOf";
import type { GameState } from "./GameState";
import { pausedAbandonDeadline } from "./pausedAbandonDeadline";

export function earliestDeadline(state: GameState): number | null {
  return state.seats.reduce<number | null>((earliest, seat) => {
    const deadline = decisionClockOf(state, seat.seat)?.deadline ?? null;
    return deadline !== null && (earliest === null || deadline < earliest) ? deadline : earliest;
  }, pausedAbandonDeadline(state));
}
