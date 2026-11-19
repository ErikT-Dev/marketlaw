import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";

type ComboOfCard = {
  readonly card: CardName;
  readonly combo: number;
};

export function isInfiniteCombo({ card, combo }: ComboOfCard): boolean {
  const found = cardOf(card).combos[combo];
  return found?.kind === "type_count" && found.isInfinite;
}
