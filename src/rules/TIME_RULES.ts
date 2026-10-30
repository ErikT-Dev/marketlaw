export const TIME_RULES = {
  mainFreeMs: 45_000,
  goFreeMs: 5_000,
  firstGoLimitMs: 45_000,
  goLimitMs: 30_000,
  mainLimitFirstTurnSeconds: 180,
  mainLimitMostSeconds: 300,
  mainLimitGrowthSeconds: 120,
  mainLimitGrowthTurns: 19,
  timeoutsBeforeLeaving: 3,
} as const;
