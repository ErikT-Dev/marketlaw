import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import type { SeatNumber } from "../../../shared/SeatNumber";

export function playerIconOf(
  playerIcons: ReadonlyArray<PlayerIconChoice>,
  seat: SeatNumber,
): PlayerIconChoice | null {
  return playerIcons[seat - 1] ?? null;
}
