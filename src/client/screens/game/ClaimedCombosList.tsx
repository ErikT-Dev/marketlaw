import type { ClaimedCombo } from "../../../shared/ClaimedCombo";
import { combosInListOrder } from "../../sorting/combosInListOrder";
import { ComboNeedAndGain } from "./ComboNeedAndGain";
import styles from "./OpponentBoardDialog.module.css";

type Props = {
  readonly combosClaimed: ReadonlyArray<ClaimedCombo>;
  readonly name: string;
};

export function ClaimedCombosList({ combosClaimed, name }: Props) {
  if (combosClaimed.length === 0) {
    return <p className={styles["noCombos"]}>No combos claimed yet.</p>;
  }
  return (
    <ul className={styles["claimedCombos"]} aria-label={`Combos claimed by ${name}`}>
      {combosInListOrder(combosClaimed, () => false).map((claimed) => (
        <li key={`${claimed.card}-${String(claimed.combo)}`} className={styles["claimedCombo"]}>
          <ComboNeedAndGain card={claimed.card} combo={claimed.combo} owner="another_player" />
          <span>{claimed.times > 1 ? `×${String(claimed.times)}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}
