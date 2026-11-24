import type { SeatState } from "./SeatState";
import { statsGainOf } from "./statsGainOf";

export function endOfTurnSteps(seat: SeatState): SeatState {
  if (seat.departure !== null) {
    return seat;
  }
  const { stats } = seat;
  const { income } = stats;
  const statsGain = statsGainOf(stats);
  return {
    ...seat,
    stats: {
      ...stats,
      influence: stats.influence + 1,
      funds: Math.max(0, stats.funds + income + statsGain),
    },
    hasPlayedThisTurn: false,
    worthGained: seat.worthGained + income + Math.max(0, statsGain),
  };
}
