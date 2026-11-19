import { TYPE_NAMES } from "../../shared/catalogue/TYPE_NAMES";
import type { TypeName } from "../../shared/catalogue/TypeName";
import type { SeatTypeCounts } from "../../shared/SeatTypeCounts";
import { compareAlphabetically } from "./compareAlphabetically";

function inCountOrder(
  types: ReadonlyArray<TypeName>,
  typeCounts: SeatTypeCounts,
): ReadonlyArray<TypeName> {
  return types
    .filter((type) => (typeCounts[type] ?? 0) > 0)
    .sort(
      (type, other) =>
        (typeCounts[other] ?? 0) - (typeCounts[type] ?? 0) || compareAlphabetically(type, other),
    );
}

export function typesInListOrder(
  typeCounts: SeatTypeCounts,
  firstTypes: ReadonlyArray<TypeName>,
): ReadonlyArray<TypeName> {
  const rest = TYPE_NAMES.filter((type) => !firstTypes.includes(type));
  return [...inCountOrder(firstTypes, typeCounts), ...inCountOrder(rest, typeCounts)];
}
