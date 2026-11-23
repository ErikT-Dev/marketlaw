import type { QuestOnTable } from "../shared/QuestOnTable";
import type { GameState } from "./GameState";

export function isFirstCompletedThisTurn(state: GameState, place: QuestOnTable): boolean {
  return (
    !place.isInExtraTurn && state.seats.some((seat) => seat.questsCompleted.includes(place.quest))
  );
}
