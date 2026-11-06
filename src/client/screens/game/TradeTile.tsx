import { useId } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { TradeName } from "../../../shared/TradeName";
import type { TradeStatus } from "../../../shared/TradeStatus";
import { StatAmountsIcons } from "../../components/StatAmountsIcons";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./InfluenceDialog.module.css";
import { TradeIcons } from "./TradeIcons";
import { tradeLabel } from "./tradeLabel";
import { tradeMissingAmounts } from "./tradeMissingAmounts";
import { tradeStatusText } from "./tradeStatusText";

type Props = {
  readonly seat: OwnSeatView;
  readonly status: TradeStatus;
  readonly isBusy: boolean;
  readonly onUse: (trade: TradeName) => void;
};

export function TradeTile({ seat, status, isBusy, onUse }: Props) {
  const statusId = useId();
  const statusClass =
    status.rejection === "trade_limit_reached" ? styles["status"] : styles["missing"];
  return (
    <li>
      <button
        type="button"
        className={styles["tile"]}
        aria-label={tradeLabel(status.trade, seat.buildPassPrice)}
        aria-describedby={statusId}
        disabled={isBusy || status.rejection !== null}
        onClick={() => {
          onUse(status.trade);
        }}
      >
        <TradeIcons trade={status.trade} buildPassPrice={seat.buildPassPrice} />
        <span id={statusId} className={`${styles["status"] ?? ""} ${statusClass ?? ""}`}>
          {status.rejection === "cannot_afford_trade" ? (
            <>
              {"need "}
              <StatAmountsIcons amounts={tradeMissingAmounts(seat, status)} />
            </>
          ) : (
            <TextWithIcons text={tradeStatusText(seat, status)} />
          )}
        </span>
      </button>
    </li>
  );
}
