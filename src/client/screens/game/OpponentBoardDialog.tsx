import { useEffect, useRef } from "react";
import type { GamePhase } from "../../../shared/GamePhase";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import { Button } from "../../components/Button";
import { CityCard } from "../../components/CityCard";
import { Modal } from "../../components/Modal";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import { cardsBySector } from "./cardsBySector";
import { counted } from "./counted";
import styles from "./OpponentBoardDialog.module.css";
import { LiveBankChip } from "./LiveBankChip";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly phase: GamePhase;
  readonly onClose: () => void;
};

const BOARD_STATS = [
  "funds",
  "income",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "bonus",
  "influence",
] as const satisfies ReadonlyArray<StatName>;

function turnStatus(seat: OtherSeatView): string {
  if (seat.hasLeft) {
    return "left the game";
  }
  return seat.isDone ? "done this turn" : "playing, not done yet";
}

export function OpponentBoardDialog({ seat, name, phase, onClose }: Props) {
  const closeArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeArea.current?.querySelector("button")?.focus();
  }, []);
  const hand = `Their hand: ${counted(seat.handCount, "card")}.`;
  return (
    <Modal title={`${name}'s board`} size="extraLarge" onClose={onClose}>
      <p className={styles["note"]}>
        {phase === "main"
          ? `Shown as at the start of this main phase: what they do in it is revealed when the main phase ends. ${hand}`
          : hand}
      </p>
      <div className={styles["board"]}>
        <section className={styles["box"]} aria-label={`Stats of ${name}`}>
          <ul className={styles["stats"]}>
            {BOARD_STATS.map((stat) => (
              <li key={stat}>
                <StatChip stat={stat} value={seat.stats[stat]} />
              </li>
            ))}
            <li>
              <StatChip stat="buildPasses" value={seat.buildPasses} />
            </li>
          </ul>
          <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
          <p className={styles["status"]}>This turn: {turnStatus(seat)}</p>
        </section>
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
                <CityCard key={card.name} card={card} />
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
