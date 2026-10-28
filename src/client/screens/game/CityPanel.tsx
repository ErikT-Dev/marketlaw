import type { CardName } from "../../../shared/catalogue/CardName";
import { CityCard } from "../../components/CityCard";
import { Panel } from "../../components/Panel";
import { cardsBySector } from "./cardsBySector";
import styles from "./CityPanel.module.css";

type Props = {
  readonly city: ReadonlyArray<CardName>;
};

export function CityPanel({ city }: Props) {
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
                  <CityCard key={card.name} card={card} />
                ))}
              </ul>
            ),
          )}
        </div>
      )}
    </Panel>
  );
}
