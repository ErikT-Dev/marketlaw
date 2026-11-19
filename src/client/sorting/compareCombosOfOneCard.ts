import type { Combo } from "../../shared/catalogue/Combo";
import type { ComboGain } from "../../shared/catalogue/ComboGain";
import { ComboStat } from "../../shared/catalogue/ComboStat";
import { compareAlphabetically } from "./compareAlphabetically";

type TypeCountCombo = Extract<Combo, { readonly kind: "type_count" }>;
type CardNameCombo = Extract<Combo, { readonly kind: "card_name" }>;

function compareGains(gains: ComboGain, other: ComboGain): number {
  return (
    other.amount - gains.amount ||
    ComboStat.options.indexOf(gains.stat) - ComboStat.options.indexOf(other.stat)
  );
}

function compareTypeCountCombos(combo: TypeCountCombo, other: TypeCountCombo): number {
  return (
    Number(other.isInfinite) - Number(combo.isInfinite) ||
    combo.count - other.count ||
    compareGains(combo.gains, other.gains) ||
    compareAlphabetically(combo.type, other.type)
  );
}

function compareCardNameCombos(combo: CardNameCombo, other: CardNameCombo): number {
  return compareAlphabetically(combo.card, other.card) || compareGains(combo.gains, other.gains);
}

export function compareCombosOfOneCard(combo: Combo, other: Combo): number {
  if (combo.kind === "type_count" && other.kind === "type_count") {
    return compareTypeCountCombos(combo, other);
  }
  if (combo.kind === "card_name" && other.kind === "card_name") {
    return compareCardNameCombos(combo, other);
  }
  return combo.kind === "type_count" ? -1 : 1;
}
