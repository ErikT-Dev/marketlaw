import type { ProjectName } from "../ProjectName";
import type { Sector } from "./Sector";
import type { Tier } from "./Tier";
import type { TypeName } from "./TypeName";

export type QuestNeed =
  | {
      readonly kind: "cards";
      readonly sector: Sector;
      readonly lowestTier: Tier;
      readonly count: number;
    }
  | { readonly kind: "sectors_with_tier"; readonly tier: Tier; readonly count: number }
  | { readonly kind: "type"; readonly type: TypeName; readonly count: number }
  | { readonly kind: "stat"; readonly stat: ProjectName; readonly count: number }
  | { readonly kind: "income"; readonly count: number }
  | { readonly kind: "projects"; readonly count: number };
