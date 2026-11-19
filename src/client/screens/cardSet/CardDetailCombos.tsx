import type { Combo } from "../../../shared/catalogue/Combo";
import { ComboLabel } from "../../components/ComboLabel";
import styles from "./CardDetail.module.css";

type Props = {
  readonly combos: ReadonlyArray<Combo>;
};

function comboNote(combo: Combo): string {
  if (combo.kind === "card_name") {
    return `${combo.card} in your city`;
  }
  return combo.isInfinite ? "infinite" : "";
}

export function CardDetailCombos({ combos }: Props) {
  return combos.length === 0 ? (
    "none"
  ) : (
    <ul className={styles["combos"]}>
      {combos.map((combo, index) => (
        <li key={String(index)} className={styles["combo"]}>
          <ComboLabel combo={combo} highlight="none" />
          <span aria-hidden="true">{comboNote(combo)}</span>
        </li>
      ))}
    </ul>
  );
}
