import type { StatAmounts } from "../StatAmounts";
import type { Stats } from "../Stats";

export function addedAmounts(amounts: StatAmounts, stat: keyof Stats, count: number): StatAmounts {
  return { ...amounts, [stat]: (amounts[stat] ?? 0) + count };
}
