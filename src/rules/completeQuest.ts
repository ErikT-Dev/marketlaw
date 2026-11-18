import type { QuestName } from "../shared/catalogue/QuestName";
import { questOf } from "../shared/ruleFiles/questOf";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawRandomCard } from "./drawRandomCard";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import type { SeatState } from "./SeatState";
import { updateSeat } from "./updateSeat";

function rewardedSeat(seat: SeatState, quest: QuestName): SeatState {
  const { stats, gainedType } = questOf(quest).terms.reward;
  const gainedTypes =
    gainedType === null
      ? seat.gainedTypes
      : { ...seat.gainedTypes, [gainedType]: (seat.gainedTypes[gainedType] ?? 0) + 1 };
  return {
    ...seat,
    stats: STAT_KEYS.reduce(
      (current, key) => ({ ...current, [key]: current[key] + (stats[key] ?? 0) }),
      seat.stats,
    ),
    gainedTypes,
    questsCompleted: [...seat.questsCompleted, quest],
    actionsThisTurn: seat.actionsThisTurn + 1,
  };
}

export function completeQuest(
  state: GameState,
  seat: SeatNumber,
  quest: QuestName,
  random: Random,
): GameState {
  const rewarded = updateSeat(state, seat, (current) => rewardedSeat(current, quest));
  return Array.from({ length: questOf(quest).terms.reward.draws }).reduce<GameState>(
    (drawn) => drawRandomCard(drawn, seat, "quest", random),
    rewarded,
  );
}
