import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import type { GameState } from "./GameState";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";

function questPlaceViolations(state: GameState): ReadonlyArray<string> {
  const onTable = state.quests.flatMap((place) => (place === null ? [] : [place.quest]));
  const completed = state.seats.flatMap((seat) => seat.questsCompleted);
  return QUEST_LINES.flatMap(({ name }) => {
    const places = [
      onTable.includes(name),
      state.questList.includes(name),
      completed.includes(name) && !onTable.includes(name),
    ].filter(Boolean).length;
    const isListedTwice = [...onTable, ...state.questList].filter((quest) => quest === name).length > 1;
    return places === 1 && !isListedTwice ? [] : [`I15: ${name} is in ${String(places)} places`];
  });
}

function questAgeViolations(state: GameState): ReadonlyArray<string> {
  const maxPlaces =
    state.turn >= QUEST_TABLE_RULES.fifthPlaceTurn
      ? QUEST_TABLE_RULES.placesFromFifthPlaceTurn
      : QUEST_TABLE_RULES.places;
  const tooMany =
    state.quests.length > maxPlaces
      ? [`I16: the quests table has ${String(state.quests.length)} places in turn ${String(state.turn)}`]
      : [];
  return [
    ...tooMany,
    ...state.quests.flatMap((place) => {
      if (place === null) {
        return [];
      }
      const tier = QUEST_LINES.find(({ name }) => name === place.quest)?.tier;
      if (tier === undefined) {
        return [`I16: ${place.quest} is not in the quest catalogue`];
      }
      const placedTurn = state.turn - place.turnsOnTable + 1;
      return [
        ...(place.turnsOnTable > QUEST_TABLE_RULES.turnsOnTable
          ? [`I16: ${place.quest} has been on the table for ${String(place.turnsOnTable)} turns`]
          : []),
        ...(placedTurn < QUEST_TABLE_RULES.firstTurnOfTier[tier]
          ? [`I16: ${place.quest} of tier ${String(tier)} was placed in turn ${String(placedTurn)}`]
          : []),
      ];
    }),
  ];
}

export function questTableViolations(state: GameState): ReadonlyArray<string> {
  return [...questPlaceViolations(state), ...questAgeViolations(state)];
}
