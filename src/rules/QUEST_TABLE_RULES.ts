export const QUEST_TABLE_RULES = {
  places: 4,
  placesFromFifthPlaceTurn: 5,
  fifthPlaceTurn: 20,
  turnsOnTableOfTier: { 1: 6, 2: 5, 3: 4 },
  firstTurnOfTier: { 1: 1, 2: 5, 3: 13 },
} as const;
