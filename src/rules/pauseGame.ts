import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";

export function pauseGame(state: GameState, seat: SeatNumber, at: number): GameState {
  return { ...state, pause: { at, seat } };
}
