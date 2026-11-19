import { TIME_RULES } from "./TIME_RULES";

export function mainPhaseLimitMs(turn: number): number {
  const seconds = Math.round(
    TIME_RULES.mainLimitBaseSeconds +
      ((turn - 1) * TIME_RULES.mainLimitGrowthSeconds) / TIME_RULES.mainLimitGrowthTurns,
  );
  const firstTurnExtraSeconds = turn === 1 ? TIME_RULES.mainLimitFirstTurnExtraSeconds : 0;
  return (Math.min(TIME_RULES.mainLimitMostSeconds, seconds) + firstTurnExtraSeconds) * 1000;
}
