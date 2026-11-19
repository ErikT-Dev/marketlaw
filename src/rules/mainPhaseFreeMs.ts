import { TIME_RULES } from "./TIME_RULES";

export function mainPhaseFreeMs(turn: number): number {
  return turn === 1 ? TIME_RULES.mainFreeFirstTurnMs : TIME_RULES.mainFreeMs;
}
