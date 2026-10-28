import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";

type Props = {
  readonly card: Card;
};

export function CardTileFace({ card }: Props) {
  return (
    <>
      <span className={styles["number"]} aria-hidden="true">
        #{card.number}
      </span>
      <span className={styles["name"]} aria-hidden="true">
        {card.name}
      </span>
    </>
  );
}
