import type { ComboStatus } from "../../../shared/ComboStatus";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { comboTexts } from "./comboTexts";
import styles from "./GameDialogs.module.css";

type Props = {
  readonly combos: ReadonlyArray<ComboStatus>;
  readonly onClaim: () => void;
  readonly onClose: () => void;
};

const STATS = ["workforce", "quality", "satisfaction"] as const;

function totalOf(ready: ReadonlyArray<ComboStatus>, stat: (typeof STATS)[number]): number {
  return ready.reduce((sum, { card, combo, readyTimes }) => {
    const gains = cardOf(card).combos[combo]?.gains;
    return gains?.stat === stat ? sum + gains.amount * readyTimes : sum;
  }, 0);
}

export function ClaimAllDialog({ combos, onClaim, onClose }: Props) {
  const ready = combos.filter(({ readyTimes }) => readyTimes > 0);
  const totals = STATS.map((stat) => `+${String(totalOf(ready, stat))} ${stat}`).join(" · ");
  return (
    <Modal title="Claim all combos" size="large" onClose={onClose}>
      <p className={styles["text"]}>
        {ready.length === 1
          ? "This combo is ready:"
          : `These ${String(ready.length)} combos are ready:`}
      </p>
      <ul className={styles["rows"]}>
        {ready.map((status) => {
          const { need, gain } = comboTexts(status.card, status.combo);
          const times = status.readyTimes > 1 ? ` ×${String(status.readyTimes)}` : "";
          return (
            <li key={`${status.card}-${String(status.combo)}`} className={styles["row"]}>
              <span>{need}</span>
              <strong className={styles["gain"]}>
                {gain}
                {times}
              </strong>
            </li>
          );
        })}
      </ul>
      <div className={styles["total"]}>
        <span>You will get in total</span>
        <strong>{totals}</strong>
      </div>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button look="success" onClick={onClaim}>
          Claim all
        </Button>
      </div>
    </Modal>
  );
}
