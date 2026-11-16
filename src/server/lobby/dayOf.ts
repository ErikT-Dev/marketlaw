import type { EpochMs } from "../../shared/EpochMs";
import { DAY_MS } from "./DAY_MS";

export function dayOf(now: EpochMs): number {
  return Math.floor(now / DAY_MS);
}
