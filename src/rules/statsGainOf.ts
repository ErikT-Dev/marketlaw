import type { Stats } from "../shared/Stats";

export function statsGainOf(stats: Stats): number {
  return (
    stats.workforce +
    stats.quality +
    stats.satisfaction +
    4 * stats.product +
    3 * stats.distribution
  );
}
