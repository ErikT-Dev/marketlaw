import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import { CardTileFace } from "./CardTileFace";
import { sectorColor } from "./sectorColor";

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
      style={{ background: sectorColor(card.sector, card.tier) }}
      onClick={onSelect}
    >
      <CardTileFace card={card} />
    </button>
  );
}
