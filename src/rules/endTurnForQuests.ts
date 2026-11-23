import type { QuestName } from "../shared/catalogue/QuestName";
import type { QuestOnTable } from "../shared/QuestOnTable";
import type { GameState } from "./GameState";
import { highestIncomeInGameOf } from "./highestIncomeInGameOf";
import { isFirstCompletedThisTurn } from "./isFirstCompletedThisTurn";
import type { QuestTable } from "./QuestTable";
import type { Random } from "./Random";
import { refillQuests } from "./refillQuests";
import { turnsOnTableOf } from "./turnsOnTableOf";

type PlaceAtTurnEnd = {
  readonly place: QuestOnTable | null;
  readonly returned: ReadonlyArray<QuestName>;
};

function placeAtTurnEnd(state: GameState, place: QuestOnTable | null): PlaceAtTurnEnd {
  if (place === null || place.isInExtraTurn) {
    return { place: null, returned: [] };
  }
  const isLastTurn = place.turnsOnTable >= turnsOnTableOf(place.quest);
  if (isFirstCompletedThisTurn(state, place)) {
    return {
      place: isLastTurn
        ? null
        : { ...place, turnsOnTable: place.turnsOnTable + 1, isInExtraTurn: true },
      returned: [],
    };
  }
  return isLastTurn
    ? { place: null, returned: [place.quest] }
    : { place: { ...place, turnsOnTable: place.turnsOnTable + 1 }, returned: [] };
}

export function endTurnForQuests(state: GameState, turn: number, random: Random): QuestTable {
  const ended = state.quests.map((place) => placeAtTurnEnd(state, place));
  const refilled = refillQuests(
    { quests: ended.map(({ place }) => place), questList: state.questList },
    { turn, highestIncome: highestIncomeInGameOf(state.seats) },
    random,
  );
  return {
    ...refilled,
    questList: [...refilled.questList, ...ended.flatMap(({ returned }) => returned)],
  };
}
