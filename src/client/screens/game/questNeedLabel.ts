import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import { STAT_ICONS } from "../../icons/STAT_ICONS";

function cardsLabel(need: Extract<QuestNeed, { readonly kind: "cards" }>): string {
  const cards = need.count === 1 ? "card" : "cards";
  return need.tier === "any"
    ? `${need.sector} ${cards}`
    : `tier ${String(need.tier)} ${need.sector} ${cards}`;
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
