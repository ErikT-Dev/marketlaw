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
  readonly onTake: ((card: CardName) => void) | null;
};

export function MarketplacePanel({ view, isYourGo, onTake }: Props) {
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
              onTake={
                onTake === null || slot.card === null
                  ? null
                  : () => {
                      if (slot.card !== null) {
                        onTake(slot.card);
                      }
                    }
              }
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
