import { cardOf } from "../shared/catalogue/cardOf";
import type { QuestNeed } from "../shared/catalogue/QuestNeed";
import type { SeatState } from "./SeatState";
import type { TypeCounts } from "./TypeCounts";

function sectorsWithTier(seat: SeatState, tier: number): number {
  const sectors = seat.city.map(cardOf).flatMap((card) => (card.tier === tier ? [card.sector] : []));
  return new Set(sectors).size;
}

export function questNeedHave(seat: SeatState, typeCounts: TypeCounts, need: QuestNeed): number {
  switch (need.kind) {
    case "cards":
      return seat.city
        .map(cardOf)
        .filter(
          (card) =>
            card.sector === need.sector && (need.tier === "any" || card.tier === need.tier),
        ).length;
    case "sectors_with_tier":
      return sectorsWithTier(seat, need.tier);
    case "type":
      return typeCounts[need.type] ?? 0;
    case "stat":
      return seat.stats[need.stat];
    case "income":
      return seat.stats.income;
    case "projects":
      return seat.projects.length;
  }
}
