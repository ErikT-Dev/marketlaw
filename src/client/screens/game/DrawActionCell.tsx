import type { Kind } from "../../../shared/catalogue/Kind";
import type { Tier } from "../../../shared/catalogue/Tier";
import type { DrawActionStatus } from "../../../shared/DrawActionStatus";
import styles from "./InfluenceDialog.module.css";

type Props = {
  readonly status: DrawActionStatus | undefined;
  readonly isBusy: boolean;
  readonly onDraw: (kind: Kind, tier: Tier) => void;
};

export function DrawActionCell({ status, isBusy, onDraw }: Props) {
  if (status === undefined || !status.isAnyLeft) {
    return <div className={styles["noneLeft"]}>None left</div>;
  }
  return (
    <button
      type="button"
      className={styles["draw"]}
      aria-label={`Draw ${status.kind} tier ${String(status.tier)}`}
      disabled={isBusy || status.rejection !== null}
      onClick={() => {
        onDraw(status.kind, status.tier);
      }}
    >
      Draw
    </button>
  );
}
