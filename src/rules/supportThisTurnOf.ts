import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";

export function supportThisTurnOf(state: GameState, seat: SeatNumber): number {
  return state.mainPhaseLog.reduce(
    (total, entry) =>
      entry.kind === "support" && entry.turn === state.turn && entry.seat === seat
        ? total + entry.funds
        : total,
    0,
  );
}
