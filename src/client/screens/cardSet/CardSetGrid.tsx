import type { Card } from "../../../shared/catalogue/Card";
import { cardNameSizeOf } from "../../components/cardNameSizeOf";
import { cardTileBackground } from "../../components/cardTileBackground";
import { CardTileFace } from "../../components/CardTileFace";
import { CardTilePicture } from "../../components/CardTilePicture";
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
            style={{ background: cardTileBackground(card.sector, card.tier) }}
            onClick={() => {
              openCardDetail(card.name);
            }}
          >
            <CardTilePicture photo={card.photo} />
            <CardTileFace card={card} nameSize={cardNameSizeOf(card.name, "city")} />
          </button>
        </li>
      ))}
    </ul>
  );
}
