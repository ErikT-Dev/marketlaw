import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { HandList } from "./HandList";
import { OtherSeatPanel } from "./OtherSeatPanel";
import styles from "./Screens.module.css";
import { StatsList } from "./StatsList";

type Props = {
  readonly update: RoomUpdate;
  readonly onAction: (action: ActionIntent) => void;
};

export function GamePage({ update, onAction }: Props) {
  const view = update.game?.view;
  const mine = view?.seats.find((seat) => seat.kind === "own");
  if (view === undefined || mine?.kind !== "own") {
    return null;
  }
  return (
    <main className={styles["page"]}>
      <h1>Turn {view.turn}</h1>
      <section className={styles["panel"]} aria-label="Your city">
        <h2>
          You (seat {mine.seat}){mine.isDone ? ", done" : ""}
        </h2>
        <StatsList label="Your stats" stats={mine.stats} />
        <p>City: {mine.city.length === 0 ? "empty" : mine.city.join(", ")}</p>
        <HandList hand={mine.hand} isDone={mine.isDone} onAction={onAction} />
        <div className={styles["row"]}>
          <button
            className={styles["button"]}
            type="button"
            disabled={mine.isDone}
            onClick={() => {
              onAction({ type: "end_turn" });
            }}
          >
            End turn
          </button>
        </div>
      </section>
      {view.seats.map((seat) =>
        seat.kind === "other" ? (
          <OtherSeatPanel
            key={seat.seat}
            seat={seat}
            name={update.room.playerNames[seat.seat - 1] ?? `Seat ${String(seat.seat)}`}
          />
        ) : null,
      )}
    </main>
  );
}
