import type { QuestStat } from "./QuestStat";
import type { Sector } from "./Sector";
import type { Tier } from "./Tier";
import type { TypeName } from "./TypeName";

export type QuestNeed =
  | {
      readonly kind: "cards";
      readonly sector: Sector;
      readonly tier: Tier | "any";
      readonly count: number;
    }
  | { readonly kind: "sectors_with_tier"; readonly tier: Tier; readonly count: number }
  | { readonly kind: "type"; readonly type: TypeName; readonly count: number }
  | { readonly kind: "stat"; readonly stat: QuestStat; readonly count: number }
  | { readonly kind: "income"; readonly count: number }
  | { readonly kind: "projects"; readonly count: number };
