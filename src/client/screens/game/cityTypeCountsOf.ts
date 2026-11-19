import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { SeatTypeCounts } from "../../../shared/SeatTypeCounts";

export function cityTypeCountsOf(city: ReadonlyArray<CardName>): SeatTypeCounts {
  return city
    .flatMap((name) => cardOf(name).types)
    .reduce<Partial<Record<TypeName, number>>>(
      (counts, { type, count }) => ({ ...counts, [type]: (counts[type] ?? 0) + count }),
      {},
    );
}
