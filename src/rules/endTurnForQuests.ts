import type { QuestOnTable } from "../shared/QuestOnTable";
import type { GameState } from "./GameState";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import type { QuestTable } from "./QuestTable";

function isCompletedByAnyone(state: GameState, place: QuestOnTable): boolean {
  return state.seats.some((seat) => seat.questsCompleted.includes(place.quest));
}

function hasHadItsTurns(place: QuestOnTable): boolean {
  return place.turnsOnTable >= QUEST_TABLE_RULES.turnsOnTable;
}

export function endTurnForQuests(state: GameState): QuestTable {
  const returned = state.quests.flatMap((place) =>
    place !== null && hasHadItsTurns(place) && !isCompletedByAnyone(state, place)
      ? [place.quest]
      : [],
  );
  return {
    quests: state.quests.map((place) =>
      place === null || hasHadItsTurns(place) || isCompletedByAnyone(state, place)
        ? null
        : { ...place, turnsOnTable: place.turnsOnTable + 1 },
    ),
    questList: [...state.questList, ...returned],
  };
}
