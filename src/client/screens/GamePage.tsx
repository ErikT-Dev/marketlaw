import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { Panel } from "../components/Panel";
import { Toast } from "../components/Toast";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";
import styles from "./game/GamePage.module.css";
import { GameTopBar } from "./game/GameTopBar";
import { rejectionMessage } from "./game/rejectionMessage";
import { RightColumn } from "./game/RightColumn";
import { OtherSeatPanel } from "./OtherSeatPanel";

type Props = {
  readonly update: RoomUpdate;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly onAction: (action: ActionIntent) => void;
  readonly onDismissRejection: () => void;
};

export function GamePage(props: Props) {
  const { update, rejectedMove } = props;
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
        <RightColumn
          view={view}
          seat={mine}
          playerNames={playerNames}
          pendingActions={props.pendingActions}
          onAction={props.onAction}
        />
      </main>
      {rejectedMove === null ? null : (
        <div className={styles["toasts"]}>
          <Toast
            kind="error"
            title="Move rejected"
            text={rejectionMessage(rejectedMove, mine)}
            onClose={props.onDismissRejection}
          />
        </div>
      )}
    </div>
  );
}
