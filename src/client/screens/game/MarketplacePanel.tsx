import type { CardName } from "../../../shared/catalogue/CardName";
import type { PlayerView } from "../../../shared/PlayerView";
import { Panel } from "../../components/Panel";
import { BonusTypesList } from "./BonusTypesList";
import { DeckAndDiscard } from "./DeckAndDiscard";
import styles from "./Marketplace.module.css";
import { MarketCountdown } from "./MarketCountdown";
import { MarketSlot } from "./MarketSlot";
import { Highlighted } from "./Highlighted";

type Props = {
  readonly view: PlayerView;
  readonly isYourGo: boolean;
  readonly selected: CardName | null;
  readonly onSelect: (card: CardName) => void;
  readonly onDraw: ((card: CardName) => void) | null;
};

function ownMarketGoDeadlineOf(view: PlayerView): number | null {
  const goSeat = view.seats.find(({ seat }) => seat === view.marketGo);
  return view.phase === "market" && goSeat?.seat === view.seat && goSeat.clock !== null
    ? goSeat.clock.deadline
    : null;
}

export function MarketplacePanel({ view, isYourGo, selected, onSelect, onDraw }: Props) {
  const marketGoDeadline = ownMarketGoDeadlineOf(view);
  return (
    <Highlighted part={{ kind: "panel", panel: "marketplace" }} isBlock>
      <div className={isYourGo ? styles["highlight"] : styles["plain"]}>
        <Panel
          title="Marketplace"
          aside={
            <span className={styles["header"]}>
              {marketGoDeadline === null ? null : <MarketCountdown deadline={marketGoDeadline} />}
              <BonusTypesList bonusTypes={view.bonusTypes} />
              <DeckAndDiscard deckCount={view.deckCount} discardCount={view.discardCount} />
            </span>
          }
        >
          <ul className={styles["places"]} aria-label="Marketplace places">
            {view.marketplace.map((slot) => (
              <MarketSlot
                key={slot.place}
                slot={slot}
                isSelected={slot.card !== null && slot.card === selected}
                onSelect={onSelect}
                onDraw={onDraw}
              />
            ))}
          </ul>
        </Panel>
      </div>
    </Highlighted>
  );
}
