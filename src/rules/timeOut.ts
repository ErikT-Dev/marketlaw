import type { SeatNumber } from "../shared/SeatNumber";
import { endTurn } from "./endTurn";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { takeTurnDraw } from "./takeTurnDraw";

export function timeOut(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  if (state.phase === "market") {
    const choice = { option: "B", sector: random.pickSector() } as const;
    return takeTurnDraw(state, { type: "turn_draw", seat, choice }, random, at);
  }
  return endTurn(state, seat, random, { at, isTimeOut: true });
}
