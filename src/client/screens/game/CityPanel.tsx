import type { CardName } from "../../../shared/catalogue/CardName";
import { Panel } from "../../components/Panel";
import { PlayedCard } from "../../components/PlayedCard";
import { cardsBySector } from "./cardsBySector";
import styles from "./CityPanel.module.css";

type Props = {
  readonly city: ReadonlyArray<CardName>;
  readonly selected: CardName | null;
  readonly onSelect: (card: CardName) => void;
};

export function CityPanel({ city, selected, onSelect }: Props) {
  return (
    <Panel title={`Your city · ${String(city.length)} cards`}>
      {city.length === 0 ? (
        <p className={styles["empty"]}>Empty</p>
      ) : (
        <div className={styles["sectors"]}>
          {cardsBySector(city).map(({ sector, cards }) =>
            cards.length === 0 ? null : (
              <ul key={sector} className={styles["sector"]} aria-label={`Your ${sector} cards`}>
                {cards.map((card) => (
                  <li key={card.name}>
                    <PlayedCard
                      card={card}
                      isSelected={card.name === selected}
                      onSelect={() => {
                        onSelect(card.name);
                      }}
                    />
                  </li>
                ))}
              </ul>
            ),
          )}
        </div>
      )}
    </Panel>
  );
}
