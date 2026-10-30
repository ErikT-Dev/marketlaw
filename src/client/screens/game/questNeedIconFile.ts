import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { typeIconFile } from "../../icons/typeIconFile";

export function questNeedIconFile(need: QuestNeed): string | null {
  switch (need.kind) {
    case "type":
      return typeIconFile(need.type);
    case "stat":
      return STAT_ICONS[need.stat].file;
    case "income":
      return STAT_ICONS.income.file;
    case "cards":
    case "sectors_with_tier":
    case "projects":
      return null;
  }
}
