import type { StatAmounts } from "../../../shared/StatAmounts";
import type { Trade } from "../../../shared/Trade";

export function tradeCostsShown(trade: Trade, buildPassPrice: number): StatAmounts {
  return trade.isPriceRising ? { ...trade.costs, funds: buildPassPrice } : trade.costs;
}
