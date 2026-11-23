import type { Stats } from "../../../src/shared/Stats.ts";
import { fundsWritten } from "./fundsWritten.ts";

export function statsWritten(stats: Stats): Stats {
  return { ...stats, funds: fundsWritten(stats.funds) };
}
