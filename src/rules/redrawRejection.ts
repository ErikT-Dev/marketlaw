import type { ReasonCode } from "../shared/ReasonCode";
import type { GameState } from "./GameState";
import { REDRAW_LIMIT } from "./REDRAW_LIMIT";
import type { SeatState } from "./SeatState";

const REDRAW_TURN = 1;

export function redrawRejection(state: GameState, seat: SeatState): ReasonCode | undefined {
  if (state.turn !== REDRAW_TURN || seat.actionsThisTurn > 0) {
    return "redraw_too_late";
  }
  return seat.redrawsUsed >= REDRAW_LIMIT ? "no_redraw_left" : undefined;
}
