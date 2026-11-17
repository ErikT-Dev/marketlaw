import { RATING_RULES } from "./RATING_RULES";

function roundedAwayFromZero(value: number, decimals: number): number {
  const scale = 10 ** decimals;
  const rounded = (Math.sign(value) * Math.round(Math.abs(value) * scale)) / scale;
  return rounded === 0 ? 0 : rounded;
}

export function roundedTotalChange(changesPerOpponent: ReadonlyArray<number>): number {
  const total = changesPerOpponent.reduce((sum, change) => sum + change, 0);
  return roundedAwayFromZero(roundedAwayFromZero(total, RATING_RULES.totalDecimals), 0);
}
