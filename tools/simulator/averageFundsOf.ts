import type { GameState } from "../../src/rules/GameState.ts";
import { TENTHS_PER_FUND } from "../../src/shared/TENTHS_PER_FUND.ts";

export function averageFundsOf(state: GameState): number {
  const total = state.seats.reduce((sum, seat) => sum + seat.stats.funds, 0);
  return state.seats.length === 0 ? 0 : total / TENTHS_PER_FUND / state.seats.length;
}
