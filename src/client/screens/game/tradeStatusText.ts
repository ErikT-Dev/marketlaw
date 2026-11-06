import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { TradeStatus } from "../../../shared/TradeStatus";
import { TRADES } from "../../../shared/TRADES";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";

function usesLeftText(seat: OwnSeatView, status: TradeStatus): string {
  const limit = TRADES[status.trade].limitPerGame;
  if (limit === null) {
    return "unlimited uses";
  }
  const left = limit - (seat.influenceUses[status.trade] ?? 0);
  return `${String(left)} ${left === 1 ? "use" : "uses"} left`;
}

export function tradeStatusText(seat: OwnSeatView, status: TradeStatus): string {
  if (status.rejection === null) {
    return usesLeftText(seat, status);
  }
  return status.rejection === "trade_limit_reached" ? "used" : REJECTION_MESSAGES[status.rejection];
}
