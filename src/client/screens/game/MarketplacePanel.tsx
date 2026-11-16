import type { CardName } from "../../../shared/catalogue/CardName";
import type { PlayerView } from "../../../shared/PlayerView";
import { Panel } from "../../components/Panel";
import { BonusTypesList } from "./BonusTypesList";
import { DeckAndDiscard } from "./DeckAndDiscard";
import styles from "./Marketplace.module.css";
import { MarketSlot } from "./MarketSlot";

type Props = {
  readonly view: PlayerView;
  readonly isYourGo: boolean;
  readonly selected: CardName | null;
  readonly onSelect: (card: CardName) => void;
  readonly onDraw: ((card: CardName) => void) | null;
};

export function MarketplacePanel({ view, isYourGo, selected, onSelect, onDraw }: Props) {
  return (
    <div className={isYourGo ? styles["highlight"] : styles["plain"]}>
      <Panel
        title="Marketplace"
        aside={
          <span className={styles["header"]}>
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
  );
}
