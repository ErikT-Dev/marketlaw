import { cardOf } from "../../shared/catalogue/cardOf";
import type { Combo } from "../../shared/catalogue/Combo";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import styles from "./BigCard.module.css";
import type { ComboHighlight } from "./ComboHighlight";
import { StatChip } from "./StatChip";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly combo: Combo;
  readonly highlight: ComboHighlight;
};

const HIGHLIGHT_TEXTS: Readonly<Record<ComboHighlight, string>> = {
  needed_card_in_city: ", that card is in your city",
  needed_card_in_hand: ", that card is in your hand",
  none: "",
};

const HIGHLIGHT_CLASSES: Readonly<Record<ComboHighlight, string>> = {
  needed_card_in_city: "neededCardInCity",
  needed_card_in_hand: "neededCardInHand",
  none: "",
};

function comboName(combo: Combo, highlight: ComboHighlight): string {
  const needs = combo.kind === "card_name" ? combo.card : `${String(combo.count)} ${combo.type}`;
  const gains = `${String(combo.gains.amount)} ${STAT_ICONS[combo.gains.stat].label.toLowerCase()}`;
  const infinite = combo.kind === "type_count" && combo.isInfinite ? ", again each time" : "";
  return `Combo: ${needs} gives ${gains}${infinite}${HIGHLIGHT_TEXTS[highlight]}`;
}

export function ComboLabel({ combo, highlight }: Props) {
  const isInfinite = combo.kind === "type_count" && combo.isInfinite;
  const classes = [
    styles["combo"] ?? "",
    isInfinite ? (styles["infinite"] ?? "") : "",
    styles[HIGHLIGHT_CLASSES[highlight]] ?? "",
  ];
  return (
    <span className={classes.join(" ")} role="group" aria-label={comboName(combo, highlight)}>
      {combo.kind === "card_name" ? `#${String(cardOf(combo.card).number)}` : combo.count}
      {combo.kind === "type_count" ? <TypeChip type={combo.type} /> : null} =
      <StatChip stat={combo.gains.stat} value={combo.gains.amount} />
    </span>
  );
}
