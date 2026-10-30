import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import { STAT_ICONS } from "../../icons/STAT_ICONS";

function cardsLabel(need: Extract<QuestNeed, { readonly kind: "cards" }>): string {
  switch (need.lowestTier) {
    case 1:
      return `${need.sector} cards`;
    case 2:
      return `tier 2 or 3 ${need.sector} cards`;
    case 3:
      return `tier 3 ${need.sector} cards`;
  }
}

export function questNeedLabel(need: QuestNeed): string {
  switch (need.kind) {
    case "cards":
      return cardsLabel(need);
    case "sectors_with_tier":
      return `sectors with a tier ${String(need.tier)} card`;
    case "type":
      return need.type;
    case "stat":
      return STAT_ICONS[need.stat].label.toLowerCase();
    case "income":
      return "income";
    case "projects":
      return need.count === 1 ? "completed project" : "completed projects";
  }
}
