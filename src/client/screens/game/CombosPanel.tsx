import type { ComboStatus } from "../../../shared/ComboStatus";
import { Panel } from "../../components/Panel";
import { ComboNeedAndGain } from "./ComboNeedAndGain";
import { combosListOf } from "./combosListOf";
import styles from "./CombosPanel.module.css";
import { isInfiniteCombo } from "./isInfiniteCombo";

type Props = {
  readonly combos: ReadonlyArray<ComboStatus>;
};

function statusText({ readyTimes, claimedTimes }: ComboStatus): string {
  if (readyTimes > 0) {
    return readyTimes === 1 ? "ready" : `ready ×${String(readyTimes)}`;
  }
  return claimedTimes > 0 ? "claimed" : "";
}

function lookOf(status: ComboStatus): string {
  const look = isInfiniteCombo(status) ? "infinite" : "oneTime";
  return status.readyTimes > 0 ? `${look}Ready` : look;
}

export function CombosPanel({ combos }: Props) {
  const listed = combosListOf(combos);
  const ready = listed.filter(({ readyTimes }) => readyTimes > 0).length;
  return (
    <Panel title={`Combos · ${String(ready)} ready`}>
      {listed.length === 0 ? (
        <p className={styles["empty"]}>Combos come with the cards in your city.</p>
      ) : (
        <ul className={styles["list"]}>
          {listed.map((status) => (
            <li
              key={`${status.card}-${String(status.combo)}`}
              className={`${styles["combo"] ?? ""} ${styles[lookOf(status)] ?? ""}`}
            >
              <ComboNeedAndGain card={status.card} combo={status.combo} owner="you" />
              <span className={styles["status"]}>{statusText(status)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
