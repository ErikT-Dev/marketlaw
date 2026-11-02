import { cardOf } from "../shared/catalogue/cardOf";
import { TYPE_NAMES } from "../shared/catalogue/TYPE_NAMES";
import type { SeatState } from "./SeatState";
import type { TypeCounts } from "./TypeCounts";

export function typeCountsOf(seat: SeatState): TypeCounts {
  const fromCity = seat.city.flatMap((name) => cardOf(name).types);
  return Object.fromEntries(
    TYPE_NAMES.flatMap((type) => {
      const count = fromCity.reduce(
        (sum, entry) => (entry.type === type ? sum + entry.count : sum),
        seat.gainedTypes[type] ?? 0,
      );
      return count === 0 ? [] : [[type, count]];
    }),
  );
}
