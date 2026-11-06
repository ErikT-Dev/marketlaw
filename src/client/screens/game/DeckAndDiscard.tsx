import styles from "./DeckAndDiscard.module.css";

type Props = {
  readonly deckCount: number;
  readonly discardCount: number;
};

export function DeckAndDiscard({ deckCount, discardCount }: Props) {
  return (
    <div className={styles["piles"]}>
      <span>Deck {deckCount}</span>
      <span>Discard {discardCount}</span>
    </div>
  );
}
