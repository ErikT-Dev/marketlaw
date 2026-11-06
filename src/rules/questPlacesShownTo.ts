import { QUEST_TERMS } from "../shared/catalogue/QUEST_TERMS";
import type { QuestPlaceView } from "../shared/QuestPlaceView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import { negativeStatsOf } from "./negativeStatsOf";
import { questNeedHave } from "./questNeedHave";
import { rejectionOf } from "./rejectionOf";
import { seatShownTo } from "./seatShownTo";
import { typeCountsOf } from "./typeCountsOf";

export function questPlacesShownTo(
  state: GameState,
  viewer: SeatNumber,
): ReadonlyArray<QuestPlaceView> {
  const shownSeats = state.seats.map((seat) => {
    const shown = seatShownTo(state, seat, viewer);
    return { shown, typeCounts: typeCountsOf(shown) };
  });
  return state.quests.map((place) => {
    if (place === null) {
      return { quest: null };
    }
    const { needs } = QUEST_TERMS[place.quest];
    return {
      quest: place.quest,
      turnsLeft: QUEST_TABLE_RULES.turnsOnTable - place.turnsOnTable + 1,
      completeRejection:
        rejectionOf(state, { type: "complete_quest", seat: viewer, quest: place.quest }) ?? null,
      progress: shownSeats.map(({ shown, typeCounts }) => ({
        seat: shown.seat,
        isCompleted: shown.questsCompleted.includes(place.quest),
        have: needs.map((need) => questNeedHave(shown, typeCounts, need)),
        negativeStats: negativeStatsOf(shown.stats),
      })),
    };
  });
}
