import { cardOf } from "../../../src/shared/catalogue/cardOf.ts";
import type { CardName } from "../../../src/shared/catalogue/CardName.ts";

export function comboLabel(card: CardName, combo: number): string {
  const found = cardOf(card).combos[combo];
  if (found === undefined) {
    return `combo ${String(combo)}`;
  }
  return found.kind === "card_name" ? found.card : `${String(found.count)} ${found.type}`;
}
