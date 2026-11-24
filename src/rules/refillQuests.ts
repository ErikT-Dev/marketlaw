import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import { isQuestPlaceable } from "./isQuestPlaceable";
import { pickTier } from "./pickTier";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import type { QuestTable } from "./QuestTable";
import { questTierToPlace } from "./questTierToPlace";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";

type RefillMoment = {
  readonly turn: number;
  readonly highestIncome: number;
};

function withFifthPlace(table: QuestTable, turn: number): QuestTable {
  const isFifthPlaceDue =
    turn >= QUEST_TABLE_RULES.fifthPlaceTurn &&
    table.quests.length < QUEST_TABLE_RULES.placesFromFifthPlaceTurn;
  return isFifthPlaceDue ? { ...table, quests: [...table.quests, null] } : table;
}

function fillPlace(
  table: QuestTable,
  index: number,
  moment: RefillMoment,
  random: Random,
): QuestTable {
  if (table.questList.length === 0) {
    return table;
  }
  const placeable = table.questList.filter((quest) =>
    isQuestPlaceable(quest, moment.highestIncome),
  );
  const tier = questTierToPlace(
    pickTier(tierChancesByTurn(moment.turn), random),
    moment.turn,
    placeable,
  );
  const candidates = QUEST_LINES.filter(
    (quest) => quest.tier === tier && placeable.includes(quest.name),
  ).map(({ name }) => name);
  if (candidates.length === 0) {
    return table;
  }
  const quest = random.pickQuest(candidates);
  return {
    quests: table.quests.map((place, at) =>
      at === index ? { quest, turnsOnTable: 1, isInExtraTurn: false } : place,
    ),
    questList: table.questList.filter((name) => name !== quest),
  };
}

export function refillQuests(table: QuestTable, moment: RefillMoment, random: Random): QuestTable {
  const widened = withFifthPlace(table, moment.turn);
  return widened.quests.reduce<QuestTable>(
    (filled, place, index) => (place === null ? fillPlace(filled, index, moment, random) : filled),
    widened,
  );
}
