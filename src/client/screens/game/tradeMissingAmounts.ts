import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { StatAmounts } from "../../../shared/StatAmounts";
import type { TradeStatus } from "../../../shared/TradeStatus";
import { TRADES } from "../../../shared/TRADES";

export function tradeMissingAmounts(seat: OwnSeatView, status: TradeStatus): StatAmounts {
  const costs =
    status.trade === "buy_build_pass" ? { funds: seat.buildPassPrice } : TRADES[status.trade].costs;
  return Object.fromEntries(
    Object.entries(costs).flatMap(([stat, amount]) => {
      const have = Object.entries(seat.stats).find(([name]) => name === stat)?.[1] ?? 0;
      return have >= amount ? [] : [[stat, amount - have]];
    }),
  );
}
