import type { CardName } from "../../../src/shared/catalogue/CardName.ts";
import { cardOf } from "../../../src/shared/catalogue/cardOf.ts";
import type { Combo } from "../../../src/shared/catalogue/Combo.ts";
import { cardDetailOf } from "../../../src/client/screens/cardSet/cardDetailOf.ts";

function comboThen(combo: Combo) {
  return {
    needs: combo.kind === "card_name" ? combo.card : `${String(combo.count)} ${combo.type}`,
    gives: `${String(combo.gains.amount)} ${combo.gains.stat}`,
    infinite: combo.kind === "type_count" && combo.isInfinite,
  };
}

export function cardDetailThen(name: CardName) {
  const detail = cardDetailOf(cardOf(name));
  const { card } = detail;
  return {
    name: card.name,
    sector: card.sector,
    tier: card.tier,
    base_cost: card.baseCost,
    ...Object.fromEntries(
      [...detail.gives, ...detail.usesUp].map(({ stat, amount }) => [stat, amount]),
    ),
    types: detail.types,
    double_types: detail.doubleTypes,
    combos: card.combos.map(comboThen),
  };
}
