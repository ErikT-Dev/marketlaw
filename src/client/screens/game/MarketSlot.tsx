import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { MarketplaceSlot } from "../../../shared/MarketplaceSlot";
import { sectorColor } from "../../components/sectorColor";
import { iconUrl } from "../../icons/iconUrl";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { MarketCardFace } from "./MarketCardFace";
import styles from "./Marketplace.module.css";
import { MARKETPLACE_PLACE_LABELS } from "./MARKETPLACE_PLACE_LABELS";
import { SelectableMarketCard } from "./SelectableMarketCard";

type Props = {
  readonly slot: MarketplaceSlot;
  readonly isSelected: boolean;
  readonly onSelect: ((card: CardName) => void) | null;
  readonly onDraw: ((card: CardName) => void) | null;
};

export function MarketSlot({ slot, isSelected, onSelect, onDraw }: Props) {
  const { name, stat } = MARKETPLACE_PLACE_LABELS[slot.place];
  const card = slot.card === null ? null : cardOf(slot.card);
  return (
    <li className={styles["slot"]}>
      <span className={styles["place"]}>
        {name}
        {stat === null ? null : (
          <img className={styles["placeIcon"]} src={iconUrl(STAT_ICONS[stat].file)} alt={stat} />
        )}
      </span>
      {slot.card !== null && onSelect !== null ? (
        <SelectableMarketCard
          card={slot.card}
          isSelected={isSelected}
          onSelect={onSelect}
          onDraw={onDraw}
        />
      ) : (
        <div
          className={`${styles["card"] ?? ""} ${card === null ? (styles["empty"] ?? "") : ""}`}
          style={{ background: card === null ? undefined : sectorColor(card.sector, card.tier) }}
        >
          <MarketCardFace card={slot.card} />
        </div>
      )}
    </li>
  );
}
