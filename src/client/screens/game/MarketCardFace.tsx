import { cardOf } from "../../../shared/catalogue/cardOf";
import type { CardName } from "../../../shared/catalogue/CardName";
import styles from "./Marketplace.module.css";

type Props = {
  readonly card: CardName | null;
};

export function MarketCardFace({ card }: Props) {
  if (card === null) {
    return <span className={styles["emptyText"]}>Empty until next turn</span>;
  }
  const { tier, name } = cardOf(card);
  return (
    <>
      <span className={styles["tier"]}>Tier {tier}</span>
      <span className={styles["name"]}>{name}</span>
    </>
  );
}
