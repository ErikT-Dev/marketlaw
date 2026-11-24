import type { SeatState } from "./SeatState";

export function highestIncomeInGameOf(seats: ReadonlyArray<SeatState>): number {
  return Math.max(
    Number.NEGATIVE_INFINITY,
    ...seats.filter((seat) => seat.departure === null).map((seat) => seat.stats.income),
  );
}
