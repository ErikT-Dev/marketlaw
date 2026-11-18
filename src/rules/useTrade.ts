import { tradeOf } from "../shared/ruleFiles/tradeOf";
import type { Stats } from "../shared/Stats";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import type { TradeName } from "../shared/TradeName";
import type { SeatState } from "./SeatState";
import { tradeCostsOf } from "./tradeCostsOf";

function statsAfterTrade(seat: SeatState, trade: TradeName): Stats {
  const costs = tradeCostsOf(seat, trade);
  const gains = tradeOf(trade).gains;
  return STAT_KEYS.reduce(
    (stats, stat) => ({ ...stats, [stat]: stats[stat] - (costs[stat] ?? 0) + (gains[stat] ?? 0) }),
    seat.stats,
  );
}

export function useTrade(seat: SeatState, trade: TradeName): SeatState {
  const { buildPasses, isPriceRising, limitPerGame } = tradeOf(trade);
  return {
    ...seat,
    stats: statsAfterTrade(seat, trade),
    buildPasses: seat.buildPasses + buildPasses,
    buildPassesBought: isPriceRising ? seat.buildPassesBought + 1 : seat.buildPassesBought,
    influenceUses:
      limitPerGame === null
        ? seat.influenceUses
        : { ...seat.influenceUses, [trade]: (seat.influenceUses[trade] ?? 0) + 1 },
    actionsThisTurn: seat.actionsThisTurn + 1,
  };
}
