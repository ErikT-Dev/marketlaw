import type { QuestCompletedLastTurn } from "../shared/QuestCompletedLastTurn";
import type { GameState } from "./GameState";

export function questsCompletedThisTurnOf(state: GameState): ReadonlyArray<QuestCompletedLastTurn> {
  return state.quests.flatMap((place) => {
    if (place === null) {
      return [];
    }
    const seats = state.seats
      .filter((seat) =>
        state.mainPhaseLog.some(
          (entry) =>
            entry.kind === "completed_quest" &&
            entry.turn === state.turn &&
            entry.seat === seat.seat &&
            entry.quest === place.quest,
        ),
      )
      .map((seat) => seat.seat);
    return seats.length === 0 ? [] : [{ quest: place.quest, seats }];
  });
}
