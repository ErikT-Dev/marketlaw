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
  if (trade === "skip_build" && seat.hasPlayedThisTurn) {
    return "skip_build_after_play";
  }
  const costs = tradeCostsOf(seat, trade);
  const canAfford = STAT_KEYS.every((stat) => seat.stats[stat] >= (costs[stat] ?? 0));
  return canAfford ? undefined : "cannot_afford_trade";
}
