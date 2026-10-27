import type { OtherSeatView } from "../../shared/OtherSeatView";
import styles from "./Screens.module.css";
import { StatsList } from "./StatsList";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
};

export function OtherSeatPanel({ seat, name }: Props) {
  return (
    <section className={styles["panel"]} aria-label={`${name}, seat ${String(seat.seat)}`}>
      <h2>
        {name} (seat {seat.seat}){seat.isDone ? ", done" : ""}
      </h2>
      <p>Cards in hand: {seat.handCount}</p>
      <p>City: {seat.city.length === 0 ? "empty" : seat.city.join(", ")}</p>
      <StatsList label={`Stats of ${name}`} stats={seat.stats} />
    </section>
  );
}
