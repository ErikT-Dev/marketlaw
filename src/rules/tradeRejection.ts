import type { ReasonCode } from "../shared/ReasonCode";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import type { TradeName } from "../shared/TradeName";
import { TRADES } from "../shared/TRADES";
import type { SeatState } from "./SeatState";
import { tradeCostsOf } from "./tradeCostsOf";

export function tradeRejection(seat: SeatState, trade: TradeName): ReasonCode | undefined {
  const limit = TRADES[trade].limitPerGame;
  if (limit !== null && (seat.influenceUses[trade] ?? 0) >= limit) {
    return "trade_limit_reached";
  }
  const costs = tradeCostsOf(seat, trade);
  const canAfford = STAT_KEYS.every((stat) => {
    const cost = costs[stat];
    return cost === undefined || seat.stats[stat] >= cost;
  });
  return canAfford ? undefined : "cannot_afford_trade";
}
