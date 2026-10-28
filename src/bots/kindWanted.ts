import type { Kind } from "../shared/catalogue/Kind";
import type { Stats } from "../shared/Stats";

export function kindWanted(stats: Stats): Kind {
  if (stats.workforce < 2) {
    return "Residential";
  }
  if (stats.quality < 1) {
    return "Public quality card";
  }
  if (stats.satisfaction < 1) {
    return "Public satisfaction card";
  }
  return stats.product <= stats.distribution ? "Industry" : "Service";
}
