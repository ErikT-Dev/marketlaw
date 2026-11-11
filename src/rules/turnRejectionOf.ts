import type { ReasonCode } from "../shared/ReasonCode";
import type { SeatNumber } from "../shared/SeatNumber";
import { ACTION_LIMIT } from "./ACTION_LIMIT";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { marketGoOf } from "./marketGoOf";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";

function phaseRejectionOf(
  state: GameState,
  seat: SeatState,
  actionType: GameAction["type"],
): ReasonCode | undefined {
  const isTurnDraw = actionType === "turn_draw";
  if (state.phase !== "market") {
    return isTurnDraw ? "wrong_phase" : undefined;
  }
  if (!isTurnDraw) {
    return seat.hasHadMarketGo ? undefined : "wrong_phase";
  }
  if (seat.hasHadMarketGo) {
    return "out_of_market";
  }
  return marketGoOf(state) === seat.seat ? undefined : "not_your_go";
}

export function turnRejectionOf(
  state: GameState,
  seatNumber: SeatNumber,
  actionType: GameAction["type"],
): ReasonCode | undefined {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || seat.departure !== null) {
    return "not_in_game";
  }
  if (state.phase === "ended") {
    return "game_over";
  }
  if (actionType === "leave_game" || actionType === "call_vote" || actionType === "vote") {
    return undefined;
  }
  const phaseCode = phaseRejectionOf(state, seat, actionType);
  if (phaseCode !== undefined) {
    return phaseCode;
  }
  if (seat.isDone) {
    return "already_done";
  }
  return actionType !== "end_turn" && seat.actionsThisTurn >= ACTION_LIMIT
    ? "action_limit_reached"
    : undefined;
}
