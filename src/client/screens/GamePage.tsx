import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import styles from "./game/GamePage.module.css";
import { GameTopBar } from "./game/GameTopBar";
import { YourStatsPanel } from "./game/YourStatsPanel";
import { HandList } from "./HandList";
import { OtherSeatPanel } from "./OtherSeatPanel";

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
  const playerNames = update.room.playerNames;
  return (
    <div className={styles["page"]}>
      <GameTopBar view={view} playerNames={playerNames} />
      <main className={styles["table"]}>
        <div className={styles["left"]}>
          <Panel title="Opponents">
            {view.seats.map((seat) =>
              seat.kind === "other" ? (
                <OtherSeatPanel
                  key={seat.seat}
                  seat={seat}
                  name={playerNames[seat.seat - 1] ?? `Seat ${String(seat.seat)}`}
                />
              ) : null,
            )}
          </Panel>
          <Panel title="Draw log" />
        </div>
        <div className={styles["middle"]}>
          <Panel title="Marketplace" />
          <Panel title="Quests" />
          <div className={styles["cityRow"]}>
            <Panel title={`Your city · ${String(mine.city.length)} cards`}>
              <p>{mine.city.length === 0 ? "Empty" : mine.city.join(", ")}</p>
            </Panel>
            <Panel title="Combos" />
          </div>
        </div>
        <div className={styles["right"]}>
          <YourStatsPanel seat={mine} />
          <Panel title={`Your hand · ${String(mine.hand.length)} cards`}>
            <HandList hand={mine.hand} isDone={mine.isDone} onAction={onAction} />
          </Panel>
          <Panel title="Actions">
            <Button
              look="success"
              isDisabled={mine.isDone}
              onClick={() => {
                onAction({ type: "end_turn" });
              }}
            >
              End turn
            </Button>
          </Panel>
        </div>
      </main>
    </div>
  );
}
