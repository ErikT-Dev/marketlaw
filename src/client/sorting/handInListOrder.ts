import { cardOf } from "../../shared/catalogue/cardOf";
import { Sector } from "../../shared/catalogue/Sector";
import type { HandCardDetails } from "../../shared/HandCardDetails";

function sortKeysOf({ card }: HandCardDetails): ReadonlyArray<number> {
  const { sector, tier, number } = cardOf(card);
  return [Sector.options.indexOf(sector), tier, number];
}

export function handInListOrder(
  hand: ReadonlyArray<HandCardDetails>,
): ReadonlyArray<HandCardDetails> {
  return [...hand].sort((details, other) => {
    const keys = sortKeysOf(details);
    const otherKeys = sortKeysOf(other);
    return keys.reduce((order, key, index) => order || key - (otherKeys[index] ?? 0), 0);
  });
}
