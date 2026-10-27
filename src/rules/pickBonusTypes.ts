import { TYPE_NAMES } from "../shared/catalogue/TYPE_NAMES";
import type { TypeName } from "../shared/catalogue/TypeName";
import type { Random } from "./Random";

export function pickBonusTypes(random: Random): ReadonlyArray<TypeName> {
  const first = random.pickType(TYPE_NAMES);
  const second = random.pickType(TYPE_NAMES.filter((type) => type !== first));
  return [first, second];
}
