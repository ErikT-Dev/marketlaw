import type { ReasonCode } from "../shared/ReasonCode";
import type { SeatNumber } from "../shared/SeatNumber";
import { ACTION_LIMIT } from "./ACTION_LIMIT";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";

export function turnRejectionOf(
  state: GameState,
  seatNumber: SeatNumber,
  actionType: GameAction["type"],
): ReasonCode | undefined {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || seat.hasLeft) {
    return "not_in_game";
  }
  if (state.phase === "ended") {
    return "game_over";
  }
  if (seat.isDone) {
    return "already_done";
  }
  return actionType !== "end_turn" && seat.actionsThisTurn >= ACTION_LIMIT
    ? "action_limit_reached"
    : undefined;
}
