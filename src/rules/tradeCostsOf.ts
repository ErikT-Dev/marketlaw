import { RISING_PRICE_STEP } from "../shared/ruleFiles/RISING_PRICE_STEP";
import { tradeOf } from "../shared/ruleFiles/tradeOf";
import type { StatAmounts } from "../shared/StatAmounts";
import type { TradeName } from "../shared/TradeName";
import type { SeatState } from "./SeatState";

export function tradeCostsOf(seat: SeatState, trade: TradeName): StatAmounts {
  const { costs, isPriceRising } = tradeOf(trade);
  return isPriceRising ? { ...costs, funds: (costs.funds ?? 0) + seat.buildPassesBought * RISING_PRICE_STEP } : costs;
}
