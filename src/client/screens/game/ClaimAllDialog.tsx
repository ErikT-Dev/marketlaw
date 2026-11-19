import type { ComboStatus } from "../../../shared/ComboStatus";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { combosListOf } from "./combosListOf";
import { StatChip } from "../../components/StatChip";
import styles from "./GameDialogs.module.css";
import { ReadyComboRow } from "./ReadyComboRow";

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
  const ready = combosListOf(combos).filter(({ readyTimes }) => readyTimes > 0);
  return (
    <Modal title="Claim all combos" size="large" onClose={onClose}>
      <p className={styles["text"]}>
        {ready.length === 1
          ? "This combo is ready:"
          : `These ${String(ready.length)} combos are ready:`}
      </p>
      <ul className={styles["rows"]} aria-label="Ready combos">
        {ready.map((status) => (
          <ReadyComboRow key={`${status.card}-${String(status.combo)}`} status={status} />
        ))}
      </ul>
      <div className={styles["total"]}>
        <span>You will get in total</span>
        <strong>
          {STATS.map((stat, index) => (
            <span key={stat}>
              {index === 0 ? null : " · "}
              <StatChip stat={stat} value={`+${String(totalOf(ready, stat))}`} />
            </span>
          ))}
        </strong>
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
