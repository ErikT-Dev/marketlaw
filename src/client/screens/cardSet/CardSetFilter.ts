import type { Sector } from "../../../shared/catalogue/Sector";
import type { Tier } from "../../../shared/catalogue/Tier";
import type { TypeName } from "../../../shared/catalogue/TypeName";

export type CardSetFilter = {
  readonly sector: Sector | null;
  readonly tier: Tier | null;
  readonly type: TypeName | null;
  readonly nameText: string;
};
