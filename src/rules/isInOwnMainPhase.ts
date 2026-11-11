import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";

export function isInOwnMainPhase(state: GameState, seat: SeatState): boolean {
  switch (state.phase) {
    case "main":
      return true;
    case "market":
      return seat.hasHadMarketGo;
    case "ended":
      return false;
  }
}
