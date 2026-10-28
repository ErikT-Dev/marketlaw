import type { Kind } from "../../../shared/catalogue/Kind";
import type { Tier } from "../../../shared/catalogue/Tier";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { TradeName } from "../../../shared/TradeName";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { counted } from "./counted";
import { DrawActionTable } from "./DrawActionTable";
import styles from "./GameDialogs.module.css";
import influenceStyles from "./InfluenceDialog.module.css";
import { TradeTile } from "./TradeTile";

type Props = {
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onTrade: (trade: TradeName) => void;
  readonly onDraw: (kind: Kind, tier: Tier) => void;
  readonly onClose: () => void;
};

export function InfluenceDialog({ seat, isBusy, onTrade, onDraw, onClose }: Props) {
  return (
    <Modal title="Use influence" size="extraLarge" onClose={onClose}>
      <p className={styles["text"]}>
        {`You have ${String(seat.stats.influence)} influence and ${counted(seat.stats.funds, "fund")}. Influence actions can be used any time in the main phase.`}
      </p>
      <h3 className={influenceStyles["section"]}>Trades</h3>
      <ul className={influenceStyles["tiles"]} aria-label="Trades">
        {seat.trades.map((status) => (
          <TradeTile
            key={status.trade}
            seat={seat}
            status={status}
            isBusy={isBusy}
            onUse={onTrade}
          />
        ))}
      </ul>
      <h3 className={influenceStyles["section"]}>Draw a card of a chosen kind</h3>
      <p className={influenceStyles["note"]}>
        Only kinds and tiers that are still in the deck or discard pile (as you see them) can be
        drawn.
      </p>
      <DrawActionTable drawActions={seat.drawActions} isBusy={isBusy} onDraw={onDraw} />
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
