import type { QuestName } from "../shared/catalogue/QuestName";
import { questOf } from "../shared/ruleFiles/questOf";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawRandomCard } from "./drawRandomCard";
import { firstCompletionFundsOf } from "./firstCompletionFundsOf";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import type { SeatState } from "./SeatState";
import { updateSeat } from "./updateSeat";

function rewardedSeat(seat: SeatState, quest: QuestName, extraFunds: number): SeatState {
  const { reward } = questOf(quest).terms;
  const { gainedType } = reward;
  const { stats } = reward;
  const gainedTypes =
    gainedType === null
      ? seat.gainedTypes
      : { ...seat.gainedTypes, [gainedType]: (seat.gainedTypes[gainedType] ?? 0) + 1 };
  const rewardedStats = STAT_KEYS.reduce(
    (current, key) => ({ ...current, [key]: current[key] + (stats[key] ?? 0) }),
    seat.stats,
  );
  const fundsGained = (stats.funds ?? 0) + extraFunds;
  return {
    ...seat,
    stats: { ...rewardedStats, funds: rewardedStats.funds + extraFunds },
    gainedTypes,
    questsCompleted: [...seat.questsCompleted, quest],
    actionsThisTurn: seat.actionsThisTurn + 1,
    worthGained: seat.worthGained + fundsGained,
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
  const extraFunds = isInExtraTurn(state, quest) ? 0 : firstCompletionFundsOf(quest);
  const rewarded = updateSeat(state, seat, (current) => rewardedSeat(current, quest, extraFunds));
  return Array.from({ length: questOf(quest).terms.reward.draws }).reduce<GameState>(
    (drawn) => drawRandomCard(drawn, seat, "quest", random),
    rewarded,
  );
}
