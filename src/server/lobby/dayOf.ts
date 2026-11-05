import type { EpochMs } from "../../shared/EpochMs";

const DAY_MS = 86_400_000;

export function dayOf(now: EpochMs): number {
  return Math.floor(now / DAY_MS);
}
