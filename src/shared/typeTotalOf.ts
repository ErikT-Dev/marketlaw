import type { SeatTypeCounts } from "./SeatTypeCounts";

export function typeTotalOf(typeCounts: SeatTypeCounts): number {
  return Object.values(typeCounts).reduce((total, count) => total + count, 0);
}
