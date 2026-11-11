import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { SeatPilesAtStart } from "./SeatPilesAtStart";

export function pilesStartShownTo(state: GameState, viewer: SeatNumber): SeatPilesAtStart | null {
  if (state.phase === "ended") {
    return null;
  }
  const piles = state.mainPhaseStart.piles;
  return piles.find((start) => start.seat === viewer) ?? piles[0] ?? null;
}
