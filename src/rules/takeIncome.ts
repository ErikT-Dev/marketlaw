import type { SeatNumber } from "../shared/SeatNumber";
import type { Stats } from "../shared/Stats";
import { drawRandomCard } from "./drawRandomCard";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { updateSeat } from "./updateSeat";

const INCOME_PER_PRODUCT_AND_DISTRIBUTION = 10;

function canTakeIncome(stats: Stats): boolean {
  const hasNoNegativeStat = stats.workforce >= 0 && stats.quality >= 0 && stats.satisfaction >= 0;
  return hasNoNegativeStat && stats.product >= 1 && stats.distribution >= 1;
}

export function takeIncome(state: GameState, seatNumber: SeatNumber, random: Random): GameState {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || !canTakeIncome(seat.stats)) {
    return state;
  }
  const paid = updateSeat(state, seatNumber, (current) => ({
    ...current,
    stats: {
      ...current.stats,
      product: current.stats.product - 1,
      distribution: current.stats.distribution - 1,
      income: current.stats.income + INCOME_PER_PRODUCT_AND_DISTRIBUTION,
    },
  }));
  return takeIncome(drawRandomCard(paid, seatNumber, "income", random), seatNumber, random);
}
