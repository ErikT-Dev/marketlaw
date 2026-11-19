import { useId } from "react";
import type { Combo } from "../../shared/catalogue/Combo";
import { cardOf } from "../../shared/catalogue/cardOf";
import { ComboStat } from "../../shared/catalogue/ComboStat";
import type { StatAmounts } from "../../shared/StatAmounts";
import styles from "./CardNameWithCombos.module.css";
import { StatAmountsIcons } from "./StatAmountsIcons";
import { StatChip } from "./StatChip";

type Props = {
  readonly name: string;
  readonly readyingCombos: ReadonlyArray<Extract<Combo, { readonly kind: "card_name" }>>;
};

function totalGainsOf(combos: Props["readyingCombos"]): StatAmounts {
  return Object.fromEntries(
    ComboStat.options.flatMap((stat) => {
      const total = combos
        .filter(({ gains }) => gains.stat === stat)
        .reduce((sum, { gains }) => sum + gains.amount, 0);
      return total > 0 ? [[stat, total]] : [];
    }),
  );
}

export function CardNameWithCombos({ name, readyingCombos }: Props) {
  const tooltipId = useId();
  if (readyingCombos.length === 0) {
    return <>{name}</>;
  }
  return (
    <button
      type="button"
      className={styles["name"]}
      aria-label={`${name}!`}
      aria-describedby={tooltipId}
    >
      {name} !
      <span id={tooltipId} role="tooltip" className={styles["tooltip"]}>
        <span className={styles["title"]}>Playing it makes these combos ready:</span>
        <ul className={styles["combos"]}>
          {readyingCombos.map((combo, index) => (
            <li key={`${combo.card} ${String(index)}`}>
              #{cardOf(combo.card).number} {combo.card}{" "}
              <StatChip stat={combo.gains.stat} value={`+${String(combo.gains.amount)}`} />
            </li>
          ))}
        </ul>
        <span className={styles["total"]}>
          Total: <StatAmountsIcons amounts={totalGainsOf(readyingCombos)} />
        </span>
      </span>
    </button>
  );
}
