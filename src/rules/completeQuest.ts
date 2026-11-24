import type { QuestName } from "../shared/catalogue/QuestName";
import { amountsInTenths } from "../shared/amountsInTenths";
import { questOf } from "../shared/ruleFiles/questOf";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawRandomCard } from "./drawRandomCard";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import type { SeatState } from "./SeatState";
import { updateSeat } from "./updateSeat";

const FIRST_COMPLETION_INFLUENCE = 1;

function rewardedSeat(seat: SeatState, quest: QuestName, extraInfluence: number): SeatState {
  const { reward } = questOf(quest).terms;
  const { gainedType } = reward;
  const stats = amountsInTenths(reward.stats);
  const gainedTypes =
    gainedType === null
      ? seat.gainedTypes
      : { ...seat.gainedTypes, [gainedType]: (seat.gainedTypes[gainedType] ?? 0) + 1 };
  const rewardedStats = STAT_KEYS.reduce(
    (current, key) => ({ ...current, [key]: current[key] + (stats[key] ?? 0) }),
    seat.stats,
  );
  return {
    ...seat,
    stats: { ...rewardedStats, influence: rewardedStats.influence + extraInfluence },
    gainedTypes,
    questsCompleted: [...seat.questsCompleted, quest],
    actionsThisTurn: seat.actionsThisTurn + 1,
    worthGained: seat.worthGained + (stats.funds ?? 0),
  };
}

function isInExtraTurn(state: GameState, quest: QuestName): boolean {
  return state.quests.some((place) => place?.quest === quest && place.isInExtraTurn);
}

export function completeQuest(
  state: GameState,
  seat: SeatNumber,
  quest: QuestName,
  random: Random,
): GameState {
  const extraInfluence = isInExtraTurn(state, quest) ? 0 : FIRST_COMPLETION_INFLUENCE;
  const rewarded = updateSeat(state, seat, (current) =>
    rewardedSeat(current, quest, extraInfluence),
  );
  return Array.from({ length: questOf(quest).terms.reward.draws }).reduce<GameState>(
    (drawn) => drawRandomCard(drawn, seat, "quest", random),
    rewarded,
  );
}
