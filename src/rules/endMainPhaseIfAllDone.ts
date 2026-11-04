import { endGame } from "./endGame";
import { endMainPhase } from "./endMainPhase";
import type { GameState } from "./GameState";
import { isFinalTurn } from "./isFinalTurn";
import type { Random } from "./Random";

export function endMainPhaseIfAllDone(state: GameState, random: Random, at: number): GameState {
  const isEveryoneDone = state.seats.every((seat) => seat.hasLeft || seat.isDone);
  if (!isEveryoneDone) {
    return state;
  }
  return isFinalTurn(state) ? endGame(state, at) : endMainPhase(state, random, at);
}
