import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { TradeStatus } from "../../../shared/TradeStatus";
import { TRADES } from "../../../shared/TRADES";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { amountsText } from "./amountsText";

function missingText(seat: OwnSeatView, status: TradeStatus): string {
  const costs =
    status.trade === "buy_build_pass" ? { funds: seat.buildPassPrice } : TRADES[status.trade].costs;
  const missing = Object.fromEntries(
    Object.entries(costs).flatMap(([stat, amount]) => {
      const have = Object.entries(seat.stats).find(([name]) => name === stat)?.[1] ?? 0;
      return have >= amount ? [] : [[stat, amount - have]];
    }),
  );
  return `need ${amountsText(missing)}`;
}

function usesLeftText(seat: OwnSeatView, status: TradeStatus): string {
  const limit = TRADES[status.trade].limitPerGame;
  if (limit === null) {
    return "unlimited";
  }
  const left = limit - (seat.influenceUses[status.trade] ?? 0);
  return `${String(left)} ${left === 1 ? "use" : "uses"} left`;
}

export function tradeStatusText(seat: OwnSeatView, status: TradeStatus): string {
  if (status.rejection === null) {
    return usesLeftText(seat, status);
  }
  if (status.rejection === "trade_limit_reached") {
    return "used";
  }
  return status.rejection === "cannot_afford_trade"
    ? missingText(seat, status)
    : REJECTION_MESSAGES[status.rejection];
}
