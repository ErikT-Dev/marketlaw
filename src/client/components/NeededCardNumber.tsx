import { useId } from "react";
import type { CardName } from "../../shared/catalogue/CardName";
import { cardOf } from "../../shared/catalogue/cardOf";
import styles from "./NeededCardNumber.module.css";

type Props = {
  readonly card: CardName;
};

export function NeededCardNumber({ card }: Props) {
  const tooltipId = useId();
  const number = String(cardOf(card).number);
  return (
    <button
      type="button"
      className={styles["number"]}
      aria-label={`Card #${number}`}
      aria-describedby={tooltipId}
    >
      #{number}
      <span id={tooltipId} role="tooltip" className={styles["tooltip"]}>
        {card}
      </span>
    </button>
  );
}
