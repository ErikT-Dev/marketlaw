import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { tradeOf } from "../../../shared/ruleFiles/tradeOf";
import type { StatAmounts } from "../../../shared/StatAmounts";
import type { TradeStatus } from "../../../shared/TradeStatus";
import { tradeCostsShown } from "./tradeCostsShown";

export function tradeMissingAmounts(seat: OwnSeatView, status: TradeStatus): StatAmounts {
  const costs = tradeCostsShown(tradeOf(status.trade), seat.buildPassPrice);
  return Object.fromEntries(
    Object.entries(costs).flatMap(([stat, amount]) => {
      const have = Object.entries(seat.stats).find(([name]) => name === stat)?.[1] ?? 0;
      return have >= amount ? [] : [[stat, amount - have]];
    }),
  );
}
