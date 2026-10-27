import { cardOf } from "../../shared/catalogue/cardOf";
import type { Combo } from "../../shared/catalogue/Combo";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import styles from "./BigCard.module.css";
import { StatChip } from "./StatChip";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly combo: Combo;
};

function comboName(combo: Combo): string {
  const needs = combo.kind === "card_name" ? combo.card : `${String(combo.count)} ${combo.type}`;
  const gains = `${String(combo.gains.amount)} ${STAT_ICONS[combo.gains.stat].label.toLowerCase()}`;
  const infinite = combo.kind === "type_count" && combo.isInfinite ? ", again each time" : "";
  return `Combo: ${needs} gives ${gains}${infinite}`;
}

export function ComboLabel({ combo }: Props) {
  const isInfinite = combo.kind === "type_count" && combo.isInfinite;
  return (
    <span
      className={`${styles["combo"] ?? ""} ${isInfinite ? (styles["infinite"] ?? "") : ""}`}
      role="group"
      aria-label={comboName(combo)}
    >
      {combo.kind === "card_name" ? `#${String(cardOf(combo.card).number)}` : combo.count}
      {combo.kind === "type_count" ? <TypeChip type={combo.type} /> : null} =
      <StatChip stat={combo.gains.stat} value={combo.gains.amount} />
    </span>
  );
}
