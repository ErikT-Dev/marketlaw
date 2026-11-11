import { BONUS_PER_FUND } from "./BONUS_PER_FUND";
import type { SeatState } from "./SeatState";

export function endOfTurnSteps(seat: SeatState): SeatState {
  if (seat.departure !== null) {
    return seat;
  }
  const { stats } = seat;
  const bonus =
    stats.bonus +
    stats.workforce +
    stats.quality +
    stats.satisfaction +
    4 * stats.product +
    3 * stats.distribution;
  const bonusFunds = bonus > 0 ? Math.floor(bonus / BONUS_PER_FUND) : 0;
  return {
    ...seat,
    stats: {
      ...stats,
      influence: stats.influence + 1,
      funds: stats.funds + stats.income + bonusFunds,
      bonus: bonus - bonusFunds * BONUS_PER_FUND,
    },
    hasPlayedThisTurn: false,
    hasSkippedBuild: false,
  };
}
