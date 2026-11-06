import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import type { Sector } from "../../../shared/catalogue/Sector";

export function questNeedSector(need: QuestNeed): Sector | null {
  return need.kind === "cards" ? need.sector : null;
}
