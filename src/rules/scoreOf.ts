import type { ScorePartsInHundredths } from "../shared/ScorePartsInHundredths";

export function scoreOf(parts: ScorePartsInHundredths): number {
  const hundredths = Object.values(parts).reduce((sum, part) => sum + part, 0);
  return Math.floor(hundredths / 100);
}
