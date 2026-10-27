import type { Kind } from "../shared/catalogue/Kind";
import type { Sector } from "../shared/catalogue/Sector";

export type DrawTarget =
  | { readonly by: "sector"; readonly sector: Sector }
  | { readonly by: "kind"; readonly kind: Kind };
