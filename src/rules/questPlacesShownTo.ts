import { QUEST_TERMS } from "../shared/catalogue/QUEST_TERMS";
import type { QuestPlaceView } from "../shared/QuestPlaceView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { questNeedHave } from "./questNeedHave";
import { rejectionOf } from "./rejectionOf";
import { seatShownTo } from "./seatShownTo";

export function questPlacesShownTo(
  state: GameState,
  viewer: SeatNumber,
): ReadonlyArray<QuestPlaceView> {
  const shownSeats = state.seats.map((seat) => seatShownTo(state, seat, viewer));
  return state.quests.map((place) => {
    if (place === null) {
      return { quest: null };
    }
    const { needs } = QUEST_TERMS[place.quest];
    return {
      quest: place.quest,
      turnsOnTable: place.turnsOnTable,
      completeRejection:
        rejectionOf(state, { type: "complete_quest", seat: viewer, quest: place.quest }) ?? null,
      progress: shownSeats.map((seat) => ({
        seat: seat.seat,
        isCompleted: seat.questsCompleted.includes(place.quest),
        have: needs.map((need) => questNeedHave(seat, need)),
      })),
    };
  });
}
