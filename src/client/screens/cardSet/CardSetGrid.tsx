import type { Card } from "../../../shared/catalogue/Card";
import { CardTileFace } from "../../components/CardTileFace";
import { sectorColor } from "../../components/sectorColor";
import styles from "./CardSet.module.css";
import { openCardDetail } from "./openCardDetail";

type Props = {
  readonly cards: ReadonlyArray<Card>;
};

export function CardSetGrid({ cards }: Props) {
  return (
    <ul className={styles["grid"]} aria-label="Cards">
      {cards.map((card) => (
        <li key={card.number} className={styles["tile"]}>
          <button
            type="button"
            className={styles["tileFace"]}
            aria-label={card.name}
            style={{ background: sectorColor(card.sector, card.tier) }}
            onClick={() => {
              openCardDetail(card.name);
            }}
          >
            <CardTileFace card={card} nameSize="regular" />
          </button>
        </li>
      ))}
    </ul>
  );
}
