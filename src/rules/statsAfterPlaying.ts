import type { Card } from "../shared/catalogue/Card";
import type { Stats } from "../shared/Stats";

export function statsAfterPlaying(stats: Stats, card: Card, cost: number): Stats {
  const { workforce, quality, satisfaction, product, distribution } = card.stats;
  const paid = { ...stats, funds: stats.funds - cost };
  switch (card.sector) {
    case "Residential":
      return {
        ...paid,
        workforce: stats.workforce + workforce,
        quality: stats.quality - quality,
        satisfaction: stats.satisfaction - satisfaction,
      };
    case "Industry":
    case "Service":
      return {
        ...paid,
        workforce: stats.workforce - workforce,
        quality: stats.quality - quality,
        satisfaction: stats.satisfaction - satisfaction,
        product: stats.product + product,
        distribution: stats.distribution + distribution,
      };
    case "Public":
      return {
        ...paid,
        workforce: stats.workforce - workforce,
        quality: stats.quality + quality,
        satisfaction: stats.satisfaction + satisfaction,
      };
  }
}
