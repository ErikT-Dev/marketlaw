import type { ClaimedCombo } from "./ClaimedCombo";

export function combosClaimedCountOf(combosClaimed: ReadonlyArray<ClaimedCombo>): number {
  return combosClaimed.reduce((total, { times }) => total + times, 0);
}
