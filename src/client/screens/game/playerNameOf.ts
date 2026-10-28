import type { SeatNumber } from "../../../shared/SeatNumber";

export function playerNameOf(playerNames: ReadonlyArray<string>, seat: SeatNumber): string {
  return playerNames[seat - 1] ?? `Seat ${String(seat)}`;
}
