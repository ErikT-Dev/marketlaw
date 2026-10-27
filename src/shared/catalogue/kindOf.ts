import type { Card } from "./Card";
import type { Kind } from "./Kind";

export function kindOf(card: Card): Kind {
  if (card.sector !== "Public") {
    return card.sector;
  }
  return card.stats.quality > card.stats.satisfaction
    ? "Public quality card"
    : "Public satisfaction card";
}
