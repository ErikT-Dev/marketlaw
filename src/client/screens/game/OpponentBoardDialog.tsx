import type { PlayerId } from "../../../shared/PlayerId";
import { useEffect, useRef, useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { GamePhase } from "../../../shared/GamePhase";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { PlayedCard } from "../../components/PlayedCard";
import { cardsBySector } from "./cardsBySector";
import { counted } from "./counted";
import styles from "./OpponentBoardDialog.module.css";
import { OpponentStatsOrLookedAtCard } from "./OpponentStatsOrLookedAtCard";

type Props = {
  readonly seat: OtherSeatView;
  readonly ownSeat: OwnSeatView | undefined;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly phase: GamePhase;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly onClose: () => void;
};

export function OpponentBoardDialog(props: Props) {
  const { seat, name, phase, onClose } = props;
  const closeArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeArea.current?.querySelector("button")?.focus();
  }, []);
  const [lookedAt, setLookedAt] = useState<CardName | null>(null);
  const hand = `Their hand: ${counted(seat.handCount, "card")}.`;
  return (
    <Modal title={`Detailed summary table of ${name}`} size="extraLarge" onClose={onClose}>
      <p className={styles["note"]}>
        {phase === "main"
          ? `Shown as at the start of this main phase: what they do in it is revealed when the main phase ends. ${hand}`
          : hand}
      </p>
      <div className={styles[lookedAt === null ? "board" : "boardWithCard"]}>
        <OpponentStatsOrLookedAtCard
          {...props}
          lookedAt={lookedAt}
          onCloseCard={() => {
            setLookedAt(null);
          }}
        />
        {cardsBySector(seat.city).map(({ sector, cards }) => (
          <section
            key={sector}
            className={styles["column"]}
            aria-label={`${sector} cards of ${name}`}
          >
            <h3 className={styles["sector"]}>
              {sector} · {cards.length}
            </h3>
            <ul className={styles["cards"]}>
              {cards.map((card) => (
                <li key={card.name}>
                  <PlayedCard
                    card={card}
                    isSelected={card.name === lookedAt}
                    onSelect={() => {
                      setLookedAt(card.name);
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div ref={closeArea} className={styles["close"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
