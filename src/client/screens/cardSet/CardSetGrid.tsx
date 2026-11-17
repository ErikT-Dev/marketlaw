import type { Card } from "../../../shared/catalogue/Card";
import { CardTileFace } from "../../components/CardTileFace";
import { sectorColor } from "../../components/sectorColor";
import styles from "./CardSet.module.css";

type Props = {
  readonly cards: ReadonlyArray<Card>;
};

export function CardSetGrid({ cards }: Props) {
  return (
    <ul className={styles["grid"]} aria-label="Cards">
      {cards.map((card) => (
        <li key={card.number} className={styles["tile"]} aria-label={card.name}>
          <div
            className={styles["tileFace"]}
            style={{ background: sectorColor(card.sector, card.tier) }}
          >
            <CardTileFace card={card} />
          </div>
        </li>
      ))}
    </ul>
  );
}
