import { useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import styles from "./DeckAndDiscard.module.css";
import { DiscardPileDialog } from "./DiscardPileDialog";

type Props = {
  readonly deckCount: number;
  readonly discard: ReadonlyArray<CardName>;
};

export function DeckAndDiscard({ deckCount, discard }: Props) {
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  return (
    <div className={styles["piles"]}>
      <span>Deck {deckCount}</span>
      <button
        className={styles["discardLink"]}
        type="button"
        onClick={() => {
          setIsDiscardOpen(true);
        }}
      >
        Discard {discard.length} · view ›
      </button>
      {isDiscardOpen ? (
        <DiscardPileDialog
          discard={discard}
          onClose={() => {
            setIsDiscardOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
