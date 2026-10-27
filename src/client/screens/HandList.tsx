import type { CardName } from "../../shared/catalogue/CardName";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import styles from "./Screens.module.css";

type Props = {
  readonly hand: ReadonlyArray<CardName>;
  readonly isDone: boolean;
  readonly onAction: (action: ActionIntent) => void;
};

export function HandList({ hand, isDone, onAction }: Props) {
  return (
    <ul className={styles["list"]} aria-label="Your hand">
      {hand.map((card, index) => (
        <li key={`${card}-${String(index)}`} className={styles["row"]}>
          <span>{card}</span>
          <button
            className={styles["button"]}
            type="button"
            disabled={isDone}
            onClick={() => {
              onAction({ type: "play_card", card });
            }}
          >
            Play {card}
          </button>
          <button
            className={styles["button"]}
            type="button"
            disabled={isDone}
            onClick={() => {
              onAction({ type: "sell", cards: [card] });
            }}
          >
            Sell {card}
          </button>
        </li>
      ))}
    </ul>
  );
}
