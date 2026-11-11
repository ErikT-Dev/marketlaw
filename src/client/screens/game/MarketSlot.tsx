import type { CardName } from "../../../shared/catalogue/CardName";
import type { MarketplaceSlot } from "../../../shared/MarketplaceSlot";
import { iconUrl } from "../../icons/iconUrl";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { MarketCardFace } from "./MarketCardFace";
import styles from "./Marketplace.module.css";
import { MARKETPLACE_PLACE_LABELS } from "./MARKETPLACE_PLACE_LABELS";
import { SelectableMarketCard } from "./SelectableMarketCard";

type Props = {
  readonly slot: MarketplaceSlot;
  readonly isSelected: boolean;
  readonly onSelect: (card: CardName) => void;
  readonly onDraw: ((card: CardName) => void) | null;
};

export function MarketSlot({ slot, isSelected, onSelect, onDraw }: Props) {
  const { name, stat } = MARKETPLACE_PLACE_LABELS[slot.place];
  return (
    <li className={styles["slot"]}>
      <span className={styles["place"]}>
        {name}
        {stat === null ? null : (
          <img className={styles["placeIcon"]} src={iconUrl(STAT_ICONS[stat].file)} alt={stat} />
        )}
      </span>
      {slot.card === null ? (
        <div className={`${styles["card"] ?? ""} ${styles["empty"] ?? ""}`}>
          <MarketCardFace card={null} />
        </div>
      ) : (
        <SelectableMarketCard
          card={slot.card}
          isSelected={isSelected}
          onSelect={onSelect}
          onDraw={onDraw}
        />
      )}
    </li>
  );
}
