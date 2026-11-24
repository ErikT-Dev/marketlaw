import { questOf } from "../shared/ruleFiles/questOf";
import type { QuestPlaceView } from "../shared/QuestPlaceView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { negativeStatsOf } from "./negativeStatsOf";
import { questNeedHave } from "./questNeedHave";
import { questRejection } from "./questRejection";
import { rejectionOf } from "./rejectionOf";
import { seatShownTo } from "./seatShownTo";
import { turnsOnTableOf } from "../shared/turnsOnTableOf";
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
    const { needs } = questOf(place.quest).terms;
    return {
      quest: place.quest,
      turnsLeft: place.isInExtraTurn ? 1 : turnsOnTableOf(place.quest) - place.turnsOnTable + 1,
      isInExtraTurn: place.isInExtraTurn,
      completeRejection:
        rejectionOf(state, { type: "complete_quest", seat: viewer, quest: place.quest }) ?? null,
      progress: shownSeats.map(({ shown, typeCounts }) => ({
        seat: shown.seat,
        isCompleted: shown.questsCompleted.includes(place.quest),
        canCompleteNow:
          shown.departure === null && questRejection(state, shown, place.quest) === undefined,
        have: needs.map((need) => questNeedHave(shown, typeCounts, need)),
        negativeStats: negativeStatsOf(shown.stats),
      })),
    };
  });
}
