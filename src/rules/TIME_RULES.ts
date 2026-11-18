export const TIME_RULES = {
  mainFreeMs: 75_000,
  mainFreeFirstTurnMs: 165_000,
  goFreeMs: 5_000,
  goLimitMs: 30_000,
  mainLimitBaseSeconds: 210,
  mainLimitFirstTurnExtraSeconds: 90,
  mainLimitMostSeconds: 330,
  mainLimitGrowthSeconds: 120,
  mainLimitGrowthTurns: 19,
  timeoutsBeforeLeaving: 3,
  pausedAbandonMs: 86_400_000,
} as const;
