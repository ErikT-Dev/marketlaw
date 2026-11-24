import { cardOf } from "../../../shared/catalogue/cardOf";
import type { CardName } from "../../../shared/catalogue/CardName";
import cardStyles from "../../components/Card.module.css";
import { cardNameSizeOf } from "../../components/cardNameSizeOf";
import { CardTilePicture } from "../../components/CardTilePicture";
import styles from "./Marketplace.module.css";

type Props = {
  readonly card: CardName | null;
};

export function MarketCardFace({ card }: Props) {
  if (card === null) {
    return <span className={styles["emptyText"]}>Empty until next turn</span>;
  }
  const { tier, name, photo } = cardOf(card);
  return (
    <>
      <CardTilePicture photo={photo} />
      <span className={styles["tier"]}>Tier {tier}</span>
      <span
        className={`${cardStyles["name"] ?? ""} ${cardStyles[cardNameSizeOf(name, "market")] ?? ""}`}
      >
        {name}
      </span>
    </>
  );
}
