import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import { cardNameSizeOf } from "./cardNameSizeOf";
import { cardTileBackground } from "./cardTileBackground";
import { CardTileFace } from "./CardTileFace";
import { CardTilePicture } from "./CardTilePicture";

type Props = {
  readonly card: Card;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
};

export function PlayedCard({ card, isSelected, onSelect }: Props) {
  return (
    <button
      className={`${styles["playedCard"] ?? ""} ${isSelected ? (styles["selected"] ?? "") : ""}`}
      type="button"
      aria-label={card.name}
      aria-pressed={isSelected}
      style={{ background: cardTileBackground(card.sector, card.tier) }}
      onClick={onSelect}
    >
      <CardTilePicture photo={card.photo} />
      <CardTileFace card={card} nameSize={cardNameSizeOf(card.name, "city")} />
    </button>
  );
}
