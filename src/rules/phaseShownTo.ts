import type { GamePhase } from "../shared/GamePhase";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { isInOwnMainPhase } from "./isInOwnMainPhase";
import { seatOf } from "./seatOf";

export function phaseShownTo(state: GameState, viewer: SeatNumber): GamePhase {
  const seat = seatOf(state, viewer);
  return state.phase === "market" && seat !== undefined && isInOwnMainPhase(state, seat)
    ? "main"
    : state.phase;
}
