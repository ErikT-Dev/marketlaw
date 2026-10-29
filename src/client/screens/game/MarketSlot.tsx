import { cardOf } from "../../../shared/catalogue/cardOf";
import type { MarketplaceSlot } from "../../../shared/MarketplaceSlot";
import { sectorColor } from "../../components/sectorColor";
import { iconUrl } from "../../icons/iconUrl";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import styles from "./Marketplace.module.css";
import { MARKETPLACE_PLACE_LABELS } from "./MARKETPLACE_PLACE_LABELS";

type Props = {
  readonly slot: MarketplaceSlot;
  readonly onTake: (() => void) | null;
};

function slotFaceOf(slot: MarketplaceSlot) {
  if (slot.card === null) {
    return <span className={styles["emptyText"]}>Empty until next turn</span>;
  }
  const card = cardOf(slot.card);
  return (
    <>
      <span className={styles["tier"]}>Tier {card.tier}</span>
      <span className={styles["name"]}>{card.name}</span>
    </>
  );
}

export function MarketSlot({ slot, onTake }: Props) {
  const { name, stat } = MARKETPLACE_PLACE_LABELS[slot.place];
  const card = slot.card === null ? null : cardOf(slot.card);
  const background = card === null ? undefined : sectorColor(card.sector, card.tier);
  return (
    <li className={styles["slot"]}>
      <span className={styles["place"]}>
        {name}
        {stat === null ? null : (
          <img className={styles["placeIcon"]} src={iconUrl(STAT_ICONS[stat].file)} alt={stat} />
        )}
      </span>
      {card !== null && onTake !== null ? (
        <button
          type="button"
          className={`${styles["card"] ?? ""} ${styles["takeable"] ?? ""}`}
          style={{ background }}
          aria-label={`Take ${card.name}`}
          onClick={onTake}
        >
          {slotFaceOf(slot)}
        </button>
      ) : (
        <div
          className={`${styles["card"] ?? ""} ${card === null ? (styles["empty"] ?? "") : ""}`}
          style={{ background }}
        >
          {slotFaceOf(slot)}
        </div>
      )}
    </li>
  );
}
