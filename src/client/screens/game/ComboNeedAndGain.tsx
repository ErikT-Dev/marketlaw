import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { StatChip } from "../../components/StatChip";
import { TypeChip } from "../../components/TypeChip";
import styles from "./CombosPanel.module.css";

type Props = {
  readonly card: CardName;
  readonly combo: number;
};

export function ComboNeedAndGain({ card, combo }: Props) {
  const found = cardOf(card).combos[combo];
  if (found === undefined) {
    return <span>{card}</span>;
  }
  return (
    <>
      {found.kind === "card_name" ? (
        <span>{`${card} · ${found.card} in your city`}</span>
      ) : (
        <span>
          {`${card} · ${String(found.count)} `}
          <TypeChip type={found.type} />
          {found.isInfinite ? ", again at every multiple" : null}
        </span>
      )}
      <span className={styles["gain"]}>
        <StatChip stat={found.gains.stat} value={`+${String(found.gains.amount)}`} />
      </span>
    </>
  );
}
