import { cardOf } from "../shared/catalogue/cardOf";
import { TYPE_NAMES } from "../shared/catalogue/TYPE_NAMES";
import type { TypeName } from "../shared/catalogue/TypeName";
import type { SeatState } from "./SeatState";

type TypeCounts = Readonly<Partial<Record<TypeName, number>>>;

function addCount(counts: TypeCounts, type: TypeName, count: number): TypeCounts {
  return { ...counts, [type]: (counts[type] ?? 0) + count };
}

export function typeCountsOf(seat: SeatState): TypeCounts {
  const fromCity = seat.city
    .flatMap((name) => cardOf(name).types)
    .reduce<TypeCounts>((counts, { type, count }) => addCount(counts, type, count), {});
  return TYPE_NAMES.reduce<TypeCounts>((counts, type) => {
    const gained = seat.gainedTypes[type] ?? 0;
    return gained === 0 ? counts : addCount(counts, type, gained);
  }, fromCity);
}
