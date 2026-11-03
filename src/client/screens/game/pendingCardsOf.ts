import type { CardName } from "../../../shared/catalogue/CardName";
import type { PendingAction } from "../../store/PendingAction";

export function pendingCardsOf(
  pendingActions: ReadonlyArray<PendingAction>,
): ReadonlyArray<CardName> {
  return pendingActions.flatMap(({ action }) => {
    switch (action.type) {
      case "play_card":
        return [action.card];
      case "sell":
        return action.cards;
      case "end_turn":
      case "claim_all":
      case "complete_project":
      case "complete_quest":
      case "influence":
      case "draw_action":
      case "undo":
      case "leave_game":
      case "turn_draw":
        return [];
    }
  });
}
