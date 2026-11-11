import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { takeTurnDraw } from "./takeTurnDraw";

function withOpenTurnDrawTaken(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  if (seatOf(state, seat)?.isTurnDrawOpen !== true) {
    return state;
  }
  const choice = { option: "B", sector: random.pickSector() } as const;
  return takeTurnDraw(state, { type: "turn_draw", seat, choice }, random, at);
}

export function settleBeforeDone(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  return withOpenTurnDrawTaken(state, seat, random, at);
}
