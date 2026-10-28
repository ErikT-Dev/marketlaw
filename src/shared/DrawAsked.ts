import type { Kind } from "./catalogue/Kind";
import type { Sector } from "./catalogue/Sector";
import type { Tier } from "./catalogue/Tier";

export type DrawAsked =
  | { readonly by: "sector"; readonly sector: Sector; readonly tier: Tier }
  | { readonly by: "kind"; readonly kind: Kind; readonly tier: Tier };
