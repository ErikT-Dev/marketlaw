import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import type { CardNameSize } from "./CardNameSize";

type Props = {
  readonly card: Card;
  readonly nameSize: CardNameSize;
};

export function CardTileFace({ card, nameSize }: Props) {
  return (
    <>
      <span className={styles["number"]} aria-hidden="true">
        #{card.number}
      </span>
      <span className={`${styles["name"] ?? ""} ${styles[nameSize] ?? ""}`} aria-hidden="true">
        {card.name}
      </span>
    </>
  );
}
