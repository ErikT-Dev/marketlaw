import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import { CardTileFace } from "./CardTileFace";
import { sectorColor } from "./sectorColor";

type Props = {
  readonly card: Card;
};

export function CityCard({ card }: Props) {
  return (
    <li
      className={styles["playedCard"]}
      aria-label={card.name}
      style={{ background: sectorColor(card.sector, card.tier) }}
    >
      <CardTileFace card={card} />
    </li>
  );
}
