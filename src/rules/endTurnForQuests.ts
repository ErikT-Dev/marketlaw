import type { QuestOnTable } from "../shared/QuestOnTable";
import type { GameState } from "./GameState";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import type { QuestTable } from "./QuestTable";
import type { Random } from "./Random";
import { refillQuests } from "./refillQuests";

function isCompletedByAnyone(state: GameState, place: QuestOnTable): boolean {
  return state.seats.some((seat) => seat.questsCompleted.includes(place.quest));
}

function hasHadItsTurns(place: QuestOnTable): boolean {
  return place.turnsOnTable >= QUEST_TABLE_RULES.turnsOnTable;
}

export function endTurnForQuests(state: GameState, turn: number, random: Random): QuestTable {
  const returned = state.quests.flatMap((place) =>
    place !== null && hasHadItsTurns(place) && !isCompletedByAnyone(state, place)
      ? [place.quest]
      : [],
  );
  const refilled = refillQuests(
    {
      quests: state.quests.map((place) =>
        place === null || hasHadItsTurns(place) || isCompletedByAnyone(state, place)
          ? null
          : { ...place, turnsOnTable: place.turnsOnTable + 1 },
      ),
      questList: state.questList,
    },
    turn,
    random,
  );
  return { ...refilled, questList: [...refilled.questList, ...returned] };
}
