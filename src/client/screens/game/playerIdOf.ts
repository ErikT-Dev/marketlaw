import type { PlayerId } from "../../../shared/PlayerId";
import type { SeatNumber } from "../../../shared/SeatNumber";

export function playerIdOf(playerIds: ReadonlyArray<PlayerId>, seat: SeatNumber): PlayerId | null {
  return playerIds[seat - 1] ?? null;
}
