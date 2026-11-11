import { cardOf } from "../../../shared/catalogue/cardOf";
import type { CardName } from "../../../shared/catalogue/CardName";
import { Button } from "../../components/Button";
import { sectorColor } from "../../components/sectorColor";
import { MarketCardFace } from "./MarketCardFace";
import styles from "./Marketplace.module.css";

type Props = {
  readonly card: CardName;
  readonly isSelected: boolean;
  readonly onSelect: (card: CardName) => void;
  readonly onDraw: ((card: CardName) => void) | null;
};

export function SelectableMarketCard({ card, isSelected, onSelect, onDraw }: Props) {
  const { sector, tier } = cardOf(card);
  return (
    <>
      <button
        type="button"
        className={`${styles["card"] ?? ""} ${styles[isSelected ? "selected" : "selectable"] ?? ""}`}
        style={{ background: sectorColor(sector, tier) }}
        aria-label={card}
        aria-pressed={isSelected}
        onClick={() => {
          onSelect(card);
        }}
      >
        <MarketCardFace card={card} />
      </button>
      {isSelected && onDraw !== null ? (
        <Button
          look="success"
          onClick={() => {
            onDraw(card);
          }}
        >
          Draw
        </Button>
      ) : null}
    </>
  );
}
