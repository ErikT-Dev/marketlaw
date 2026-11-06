import type { ComboStatus } from "../../../shared/ComboStatus";
import { Panel } from "../../components/Panel";
import { ComboNeedAndGain } from "./ComboNeedAndGain";
import styles from "./CombosPanel.module.css";

type Props = {
  readonly combos: ReadonlyArray<ComboStatus>;
};

function statusText({ readyTimes, claimedTimes }: ComboStatus): string {
  if (readyTimes > 0) {
    return readyTimes === 1 ? "ready" : `ready ×${String(readyTimes)}`;
  }
  return claimedTimes > 0 ? "claimed" : "";
}

export function CombosPanel({ combos }: Props) {
  const ready = combos.filter(({ readyTimes }) => readyTimes > 0).length;
  return (
    <Panel title={`Combos · ${String(ready)} ready`}>
      {combos.length === 0 ? (
        <p className={styles["empty"]}>Combos come with the cards in your city.</p>
      ) : (
        <ul className={styles["list"]}>
          {combos.map((status) => {
            return (
              <li
                key={`${status.card}-${String(status.combo)}`}
                className={`${styles["combo"] ?? ""} ${status.readyTimes > 0 ? (styles["ready"] ?? "") : ""}`}
              >
                <ComboNeedAndGain card={status.card} combo={status.combo} />
                <span className={styles["status"]}>{statusText(status)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
