import { useEffect, useRef } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./DeckAndDiscard.module.css";

type Props = {
  readonly discard: ReadonlyArray<CardName>;
  readonly onClose: () => void;
};

export function DiscardPileDialog({ discard, onClose }: Props) {
  const closeArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeArea.current?.querySelector("button")?.focus();
  }, []);
  return (
    <Modal title={`Discard pile · ${String(discard.length)} cards`} size="large">
      {discard.length === 0 ? (
        <p>The discard pile is empty.</p>
      ) : (
        <ul className={styles["discard"]}>
          {discard.map((name) => {
            const card = cardOf(name);
            return (
              <li key={name}>
                #{card.number} {card.name} · {card.sector}, tier {card.tier}
              </li>
            );
          })}
        </ul>
      )}
      <div ref={closeArea} className={styles["close"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
