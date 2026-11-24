import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { StatChip } from "../../components/StatChip";
import { ComboNeed } from "./ComboNeed";
import type { ComboOwner } from "./ComboOwner";
import styles from "./CombosPanel.module.css";

type Props = {
  readonly card: CardName;
  readonly combo: number;
  readonly owner: ComboOwner;
};

export function ComboNeedAndGain({ card, combo, owner }: Props) {
  const gains = cardOf(card).combos[combo]?.gains;
  return (
    <>
      <ComboNeed card={card} combo={combo} owner={owner} />
      {gains === undefined ? null : (
        <span className={styles["gain"]}>
          <StatChip stat={gains.stat} value={`+${String(gains.amount)}`} />
        </span>
      )}
    </>
  );
}
