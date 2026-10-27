import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import type { HandCardState } from "./HandCardState";
import { sectorColor } from "./sectorColor";

type Props = {
  readonly card: Card;
  readonly realCost: number;
  readonly isPlayable: boolean;
  readonly state: HandCardState;
  readonly onSelect: () => void;
};

const STATE_CLASS: Readonly<Record<HandCardState, string>> = {
  default: "",
  selected: "selected",
  new: "isNew",
  markedToSell: "markedToSell",
};

export function HandCard({ card, realCost, isPlayable, state, onSelect }: Props) {
  const classes = [
    styles["handCard"],
    styles[isPlayable ? "playable" : "unplayable"],
    styles[STATE_CLASS[state]],
  ].join(" ");
  return (
    <button
      className={classes}
      type="button"
      aria-label={card.name}
      aria-pressed={state === "selected" || state === "markedToSell"}
      style={{ background: sectorColor(card.sector, card.tier) }}
      onClick={onSelect}
    >
      <span className={styles["number"]} aria-hidden="true">
        #{card.number}
      </span>
      <span className={styles["name"]} aria-hidden="true">
        {card.name}
      </span>
      <span className={styles["cost"]} aria-hidden="true">
        ${realCost}
      </span>
    </button>
  );
}
