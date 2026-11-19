import { INFLUENCE_TRADES } from "../shared/ruleFiles/INFLUENCE_TRADES";
import type { SeatState } from "./SeatState";
import { tradeCostsOf } from "./tradeCostsOf";

export function buildPassPriceOf(seat: SeatState): number {
  const risingTrade = INFLUENCE_TRADES.find(({ isPriceRising }) => isPriceRising);
  return risingTrade === undefined ? 0 : (tradeCostsOf(seat, risingTrade.name).funds ?? 0);
}
