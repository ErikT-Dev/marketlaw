import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";

export function cityTypeTotalOf(city: ReadonlyArray<CardName>): number {
  return city.flatMap((name) => cardOf(name).types).reduce((total, { count }) => total + count, 0);
}
