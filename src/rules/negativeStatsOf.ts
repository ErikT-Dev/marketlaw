import type { NegativeStat } from "../shared/NegativeStat";
import { PROJECT_NAMES } from "../shared/PROJECT_NAMES";
import type { Stats } from "../shared/Stats";

export function negativeStatsOf(stats: Stats): ReadonlyArray<NegativeStat> {
  return PROJECT_NAMES.filter((stat) => stats[stat] < 0).map((stat) => ({
    stat,
    value: stats[stat],
  }));
}
