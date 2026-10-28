import { useId } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { TradeName } from "../../../shared/TradeName";
import type { TradeStatus } from "../../../shared/TradeStatus";
import styles from "./InfluenceDialog.module.css";
import { tradeLabel } from "./tradeLabel";
import { tradeStatusText } from "./tradeStatusText";

type Props = {
  readonly seat: OwnSeatView;
  readonly status: TradeStatus;
  readonly isBusy: boolean;
  readonly onUse: (trade: TradeName) => void;
};

export function TradeTile({ seat, status, isBusy, onUse }: Props) {
  const statusId = useId();
  const label = tradeLabel(status.trade, seat.buildPassPrice);
  const statusClass =
    status.rejection === "trade_limit_reached" ? styles["status"] : styles["missing"];
  return (
    <li>
      <button
        type="button"
        className={styles["tile"]}
        aria-label={label}
        aria-describedby={statusId}
        disabled={isBusy || status.rejection !== null}
        onClick={() => {
          onUse(status.trade);
        }}
      >
        <span>{label}</span>
        <span id={statusId} className={`${styles["status"] ?? ""} ${statusClass ?? ""}`}>
          {tradeStatusText(seat, status)}
        </span>
      </button>
    </li>
  );
}
