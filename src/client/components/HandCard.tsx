import { useId } from "react";
import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import { CardTileFace } from "./CardTileFace";
import { PendingMarker } from "./PendingMarker";
import type { HandCardState } from "./HandCardState";
import { sectorColor } from "./sectorColor";

type Props = {
  readonly card: Card;
  readonly realCost: number;
  readonly isPlayable: boolean;
  readonly state: HandCardState;
  readonly isPending: boolean;
  readonly onSelect: () => void;
};

const STATE_CLASS: Readonly<Record<HandCardState, string>> = {
  default: "",
  selected: "selected",
  new: "isNew",
  markedToSell: "markedToSell",
};

function handCardDescription(card: Card, realCost: number, isPlayable: boolean, isNew: boolean) {
  return [
    `Number ${String(card.number)}`,
    `real cost $${String(realCost)}`,
    ...(isNew ? ["new"] : []),
    ...(isPlayable ? [] : ["cannot be played"]),
  ].join(", ");
}

export function HandCard({ card, realCost, isPlayable, state, isPending, onSelect }: Props) {
  const descriptionId = useId();
  const classes = [
    styles["handCard"],
    styles[isPlayable ? "playable" : "unplayable"],
    styles[STATE_CLASS[state]],
    isPending ? styles["pending"] : "",
  ].join(" ");
  return (
    <button
      className={classes}
      type="button"
      aria-label={card.name}
      aria-describedby={descriptionId}
      aria-pressed={state === "selected" || state === "markedToSell"}
      disabled={isPending}
      style={{ background: sectorColor(card.sector, card.tier) }}
      onClick={onSelect}
    >
      <CardTileFace card={card} />
      <span className={styles["cost"]} aria-hidden="true">
        ${realCost}
      </span>
      {isPending ? <PendingMarker label="Waiting for the server…" /> : null}
      <span id={descriptionId} className={styles["visuallyHidden"]}>
        {handCardDescription(card, realCost, isPlayable, state === "new")}
      </span>
    </button>
  );
}
