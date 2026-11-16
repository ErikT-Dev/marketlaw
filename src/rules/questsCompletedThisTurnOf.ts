import type { QuestCompletedLastTurn } from "../shared/QuestCompletedLastTurn";
import type { GameState } from "./GameState";

export function questsCompletedThisTurnOf(state: GameState): ReadonlyArray<QuestCompletedLastTurn> {
  return state.quests.flatMap((place) => {
    if (place === null) {
      return [];
    }
    const seats = state.seats
      .filter((seat) => seat.questsCompleted.includes(place.quest))
      .map((seat) => seat.seat);
    return seats.length === 0 ? [] : [{ quest: place.quest, seats }];
  });
}
