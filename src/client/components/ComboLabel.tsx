import type { Combo } from "../../shared/catalogue/Combo";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import styles from "./BigCard.module.css";
import type { ComboHighlight } from "./ComboHighlight";
import { NeededCardNumber } from "./NeededCardNumber";
import { StatChip } from "./StatChip";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly combo: Combo;
  readonly highlight: ComboHighlight;
  readonly readyTimesOnPlay?: number | undefined;
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

function readyOnPlayText(isInfinite: boolean, readyTimes: number): string {
  if (readyTimes === 0) {
    return "";
  }
  return isInfinite ? `, ready ${String(readyTimes)} times when played` : ", ready when played";
}

function comboName(combo: Combo, highlight: ComboHighlight, readyTimes: number): string {
  const needs = combo.kind === "card_name" ? combo.card : `${String(combo.count)} ${combo.type}`;
  const gains = `${String(combo.gains.amount)} ${STAT_ICONS[combo.gains.stat].label.toLowerCase()}`;
  const isInfinite = combo.kind === "type_count" && combo.isInfinite;
  const infinite = isInfinite ? ", again each time" : "";
  return `Combo: ${needs} gives ${gains}${infinite}${HIGHLIGHT_TEXTS[highlight]}${readyOnPlayText(isInfinite, readyTimes)}`;
}

function readyClassOf(combo: Combo, readyTimes: number): string {
  if (combo.kind !== "type_count" || readyTimes === 0) {
    return "";
  }
  return (combo.isInfinite ? styles["infiniteReadyOnPlay"] : styles["readyOnPlay"]) ?? "";
}

export function ComboLabel({ combo, highlight, readyTimesOnPlay = 0 }: Props) {
  const isInfinite = combo.kind === "type_count" && combo.isInfinite;
  const classes = [
    styles["combo"] ?? "",
    isInfinite ? (styles["infinite"] ?? "") : "",
    styles[HIGHLIGHT_CLASSES[highlight]] ?? "",
    readyClassOf(combo, readyTimesOnPlay),
  ];
  return (
    <span
      className={classes.join(" ")}
      role="group"
      aria-label={comboName(combo, highlight, readyTimesOnPlay)}
    >
      {combo.kind === "card_name" ? <NeededCardNumber card={combo.card} /> : combo.count}
      {combo.kind === "type_count" ? <TypeChip type={combo.type} /> : null} =
      <StatChip stat={combo.gains.stat} value={combo.gains.amount} />
      {isInfinite && readyTimesOnPlay > 0 ? (
        <span aria-hidden="true">×{readyTimesOnPlay}</span>
      ) : null}
    </span>
  );
}
