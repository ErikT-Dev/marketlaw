import type { ComboStatus } from "../../../shared/ComboStatus";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { StatChip } from "../../components/StatChip";
import { ComboNeed } from "./ComboNeed";
import styles from "./GameDialogs.module.css";

type Props = {
  readonly status: ComboStatus;
};

export function ReadyComboRow({ status }: Props) {
  const gains = cardOf(status.card).combos[status.combo]?.gains;
  return (
    <li className={styles["row"]}>
      <ComboNeed card={status.card} combo={status.combo} owner="you" />
      <strong className={styles["gain"]}>
        {gains === undefined ? null : (
          <StatChip stat={gains.stat} value={`+${String(gains.amount)}`} />
        )}
        {status.readyTimes > 1 ? ` ×${String(status.readyTimes)}` : null}
      </strong>
    </li>
  );
}
