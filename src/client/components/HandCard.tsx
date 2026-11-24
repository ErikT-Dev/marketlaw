import { useId } from "react";
import type { Card } from "../../shared/catalogue/Card";
import styles from "./Card.module.css";
import { cardNameSizeOf } from "./cardNameSizeOf";
import { cardTileBackground } from "./cardTileBackground";
import { CardTileFace } from "./CardTileFace";
import { CardTilePicture } from "./CardTilePicture";
import { PendingMarker } from "./PendingMarker";
import type { HandCardState } from "./HandCardState";

type Props = {
  readonly card: Card;
  readonly realCost: number;
  readonly isPlayable: boolean;
  readonly state: HandCardState;
  readonly isNew: boolean;
  readonly isPending: boolean;
  readonly onSelect: () => void;
};

const STATE_CLASS: Readonly<Record<HandCardState, string>> = {
  default: "",
  selected: "selected",
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

export function HandCard({ card, realCost, isPlayable, state, isNew, isPending, onSelect }: Props) {
  const descriptionId = useId();
  const classes = [
    styles["handCard"],
    styles[isPlayable ? "playable" : "unplayable"],
    styles[STATE_CLASS[state]],
    isNew ? styles["isNew"] : "",
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
      style={{ background: cardTileBackground(card.sector, card.tier) }}
      onClick={onSelect}
    >
      <CardTilePicture photo={card.photo} />
      <CardTileFace card={card} nameSize={cardNameSizeOf(card.name, "hand")} />
      <span className={styles["cost"]} aria-hidden="true">
        ${realCost}
      </span>
      {isPending ? <PendingMarker label="Waiting for the server…" /> : null}
      <span id={descriptionId} className={styles["visuallyHidden"]}>
        {handCardDescription(card, realCost, isPlayable, isNew)}
      </span>
    </button>
  );
}
