import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { RejectedMove } from "../../store/RejectedMove";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";

function realCostOfRejectedPlay(move: RejectedMove, seat: OwnSeatView): number | undefined {
  const action = move.action;
  if (action?.type !== "play_card") {
    return undefined;
  }
  return seat.handDetails.find((details) => details.card === action.card)?.realCost;
}

export function rejectionMessage(move: RejectedMove, seat: OwnSeatView): string {
  const realCost = realCostOfRejectedPlay(move, seat);
  if (move.code !== "not_enough_funds") {
    return REJECTION_MESSAGES[move.code];
  }
  if (realCost === undefined) {
    return `You do not have enough funds; you have ${String(seat.stats.funds)}.`;
  }
  return `You need ${String(realCost)} funds; you have ${String(seat.stats.funds)}.`;
}
