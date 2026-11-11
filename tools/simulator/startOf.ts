import type { GameState } from "../../src/rules/GameState.ts";
import type { SeatState } from "../../src/rules/SeatState.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";

export function startOf(state: GameState, seat: SeatNumber): SeatState | undefined {
  return state.phase === "ended"
    ? undefined
    : state.mainPhaseStart.seats.find((start) => start.seat === seat);
}
