export const TIME_RULES = {
  mainFreeMs: 75_000,
  goFreeMs: 5_000,
  goLimitMs: 40_000,
  mainLimitFirstTurnSeconds: 210,
  mainLimitMostSeconds: 330,
  mainLimitGrowthSeconds: 120,
  mainLimitGrowthTurns: 19,
  timeoutsBeforeLeaving: 3,
  pausedAbandonMs: 86_400_000,
} as const;
