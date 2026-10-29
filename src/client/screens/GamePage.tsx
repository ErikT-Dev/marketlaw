import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { Toast } from "../components/Toast";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";
import styles from "./game/GamePage.module.css";
import { DrawLogPanel } from "./game/DrawLogPanel";
import { GameTopBar } from "./game/GameTopBar";
import { MiddleColumn } from "./game/MiddleColumn";
import { rejectionMessage } from "./game/rejectionMessage";
import { RightColumn } from "./game/RightColumn";
import { OpponentsPanel } from "./game/OpponentsPanel";

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
          <OpponentsPanel view={view} playerNames={playerNames} />
          <DrawLogPanel drawLog={view.drawLog} playerNames={playerNames} />
        </div>
        <MiddleColumn
          view={view}
          seat={mine}
          playerNames={playerNames}
          isBusy={props.pendingActions.length > 0}
          onAction={props.onAction}
        />
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
