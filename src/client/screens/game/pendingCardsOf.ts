import type { CardName } from "../../../shared/catalogue/CardName";
import type { PendingAction } from "../../store/PendingAction";

export function pendingCardsOf(
  pendingActions: ReadonlyArray<PendingAction>,
): ReadonlyArray<CardName> {
  return pendingActions.flatMap(({ action }) => {
    if (action.type === "play_card") {
      return [action.card];
    }
    return action.type === "sell" ? action.cards : [];
  });
}
