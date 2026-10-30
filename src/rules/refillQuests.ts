import { QUESTS } from "../shared/catalogue/QUESTS";
import { pickTier } from "./pickTier";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import type { QuestTable } from "./QuestTable";
import { questTierToPlace } from "./questTierToPlace";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";

function withFifthPlace(table: QuestTable, turn: number): QuestTable {
  const isFifthPlaceDue =
    turn >= QUEST_TABLE_RULES.fifthPlaceTurn &&
    table.quests.length < QUEST_TABLE_RULES.placesFromFifthPlaceTurn;
  return isFifthPlaceDue ? { ...table, quests: [...table.quests, null] } : table;
}

function fillPlace(table: QuestTable, index: number, turn: number, random: Random): QuestTable {
  if (table.questList.length === 0) {
    return table;
  }
  const tier = questTierToPlace(
    pickTier(tierChancesByTurn(turn), random),
    turn,
    table.questList,
  );
  const candidates = QUESTS.filter(
    (quest) => quest.tier === tier && table.questList.includes(quest.name),
  ).map(({ name }) => name);
  if (candidates.length === 0) {
    return table;
  }
  const quest = random.pickQuest(candidates);
  return {
    quests: table.quests.map((place, at) => (at === index ? { quest, turnsOnTable: 1 } : place)),
    questList: table.questList.filter((name) => name !== quest),
  };
}

export function refillQuests(table: QuestTable, turn: number, random: Random): QuestTable {
  const widened = withFifthPlace(table, turn);
  return widened.quests.reduce<QuestTable>(
    (filled, place, index) => (place === null ? fillPlace(filled, index, turn, random) : filled),
    widened,
  );
}
