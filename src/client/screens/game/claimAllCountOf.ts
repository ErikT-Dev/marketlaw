import type { ComboStatus } from "../../../shared/ComboStatus";

export function claimAllCountOf(combos: ReadonlyArray<ComboStatus>): number {
  return combos.reduce((total, { readyTimes }) => total + readyTimes, 0);
}
