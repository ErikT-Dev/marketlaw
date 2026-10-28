import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";

export function comboTexts(
  card: CardName,
  combo: number,
): { readonly need: string; readonly gain: string } {
  const found = cardOf(card).combos[combo];
  if (found === undefined) {
    return { need: card, gain: "" };
  }
  const need =
    found.kind === "card_name"
      ? `${card} · ${found.card} in your city`
      : `${card} · ${String(found.count)} ${found.type}${found.isInfinite ? ", again at every multiple" : ""}`;
  return { need, gain: `+${String(found.gains.amount)} ${found.gains.stat}` };
}
