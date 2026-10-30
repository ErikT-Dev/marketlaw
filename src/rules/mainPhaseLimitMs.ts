import { TIME_RULES } from "./TIME_RULES";

export function mainPhaseLimitMs(turn: number): number {
  const seconds = Math.round(
    TIME_RULES.mainLimitFirstTurnSeconds +
      ((turn - 1) * TIME_RULES.mainLimitGrowthSeconds) / TIME_RULES.mainLimitGrowthTurns,
  );
  return Math.min(TIME_RULES.mainLimitMostSeconds, seconds) * 1000;
}
