import type { SeatNumber } from "../../../shared/SeatNumber";

export function playerIconColorOf(
  playerIconColors: ReadonlyArray<number>,
  seat: SeatNumber,
): number {
  return playerIconColors[seat - 1] ?? 0;
}
