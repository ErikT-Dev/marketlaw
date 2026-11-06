import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { IconText } from "../../components/IconText";
import type { RejectedMove } from "../../store/RejectedMove";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";

function realCostOfRejectedPlay(move: RejectedMove, seat: OwnSeatView): number | undefined {
  const action = move.action;
  if (action?.type !== "play_card") {
    return undefined;
  }
  return seat.handDetails.find((details) => details.card === action.card)?.realCost;
}

export function rejectionMessage(move: RejectedMove, seat: OwnSeatView): IconText {
  const realCost = realCostOfRejectedPlay(move, seat);
  if (move.code !== "not_enough_funds") {
    return REJECTION_MESSAGES[move.code];
  }
  const funds = String(seat.stats.funds);
  if (realCost === undefined) {
    return [
      "You do not have enough ",
      { stat: "funds" },
      "; you have ",
      { stat: "funds", value: funds },
      ".",
    ];
  }
  return [
    "You need ",
    { stat: "funds", value: realCost },
    "; you have ",
    { stat: "funds", value: funds },
    ".",
  ];
}
