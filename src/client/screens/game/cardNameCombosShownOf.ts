import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { Combo } from "../../../shared/catalogue/Combo";
import type { ComboStatus } from "../../../shared/ComboStatus";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { CardNameCombosShown } from "../../components/CardNameCombosShown";
import type { ComboHighlight } from "../../components/ComboHighlight";
import { compareCombosOfOneCard } from "../../sorting/compareCombosOfOneCard";

type CardNameCombo = Extract<Combo, { readonly kind: "card_name" }>;

function isStillOpen(status: ComboStatus | undefined): boolean {
  return status === undefined || (status.claimedTimes === 0 && status.readyTimes === 0);
}

function statusOf(seat: OwnSeatView, card: CardName, combo: number): ComboStatus | undefined {
  return seat.combos.find((status) => status.card === card && status.combo === combo);
}

function cityCombosNeeding(card: CardName, seat: OwnSeatView): ReadonlyArray<CardNameCombo> {
  return seat.combos.flatMap((status) => {
    const combo = cardOf(status.card).combos[status.combo];
    return combo?.kind === "card_name" && combo.card === card && isStillOpen(status)
      ? [{ kind: "card_name", card: status.card, gains: combo.gains }]
      : [];
  });
}

function printedCombosNeedingCity(card: CardName, seat: OwnSeatView): ReadonlyArray<CardNameCombo> {
  return cardOf(card).combos.flatMap((combo, index) =>
    combo.kind === "card_name" &&
    seat.city.includes(combo.card) &&
    isStillOpen(statusOf(seat, card, index))
      ? [combo]
      : [],
  );
}

function highlightOf(combo: Combo, seat: OwnSeatView): ComboHighlight {
  if (combo.kind !== "card_name") {
    return "none";
  }
  if (seat.city.includes(combo.card)) {
    return "needed_card_in_city";
  }
  return seat.hand.includes(combo.card) ? "needed_card_in_hand" : "none";
}

export function cardNameCombosShownOf(card: CardName, seat: OwnSeatView): CardNameCombosShown {
  return {
    readyingCombos: [
      ...cityCombosNeeding(card, seat),
      ...printedCombosNeedingCity(card, seat),
    ].sort(compareCombosOfOneCard),
    comboHighlights: cardOf(card).combos.map((combo) => highlightOf(combo, seat)),
  };
}
