import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import type { GameState } from "./GameState";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";
import { turnsOnTableOf } from "./turnsOnTableOf";

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
        ...(place.turnsOnTable > turnsOnTableOf(place.quest)
          ? [`I16: ${place.quest} has been on the table for ${String(place.turnsOnTable)} turns`]
          : []),
        ...(placedTurn < QUEST_TABLE_RULES.firstTurnOfTier[tier]
          ? [`I16: ${place.quest} of tier ${String(tier)} was placed in turn ${String(placedTurn)}`]
          : []),
      ];
    }),
  ];
}

function questStayViolations(state: GameState): ReadonlyArray<string> {
  return state.quests.flatMap((place) => {
    if (place === null) {
      return [];
    }
    const completedTurns = state.mainPhaseLog.flatMap((entry) =>
      entry.kind === "completed_quest" && entry.quest === place.quest ? [entry.turn] : [],
    );
    const firstCompletedTurn = Math.min(Number.POSITIVE_INFINITY, ...completedTurns);
    const isTooLate =
      firstCompletedTurn < state.turn - 1 ||
      (firstCompletedTurn === state.turn - 1 && !place.isInExtraTurn);
    return isTooLate
      ? [`I16: ${place.quest} is still on the table after the turn after it was first completed`]
      : [];
  });
}

export function questTableViolations(state: GameState): ReadonlyArray<string> {
  return [
    ...questPlaceViolations(state),
    ...questAgeViolations(state),
    ...questStayViolations(state),
  ];
}
