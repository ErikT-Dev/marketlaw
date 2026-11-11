import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { PendingAction } from "../../store/PendingAction";
import { useState } from "react";
import { ActionsPanel } from "./ActionsPanel";
import type { OpenDialog } from "./OpenDialog";
import { ProgressDialogs } from "./ProgressDialogs";
import styles from "./GamePage.module.css";
import { HandPanel } from "./HandPanel";
import { pendingCardsOf } from "./pendingCardsOf";
import { playerNameOf } from "./playerNameOf";
import { SelectedCardPanel } from "./SelectedCardPanel";
import { useHandMoves } from "./useHandMoves";
import { YourStatsPanel } from "./YourStatsPanel";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly onAction: (action: ActionIntent) => void;
};

function namesStillPlaying(view: PlayerView, playerNames: ReadonlyArray<string>) {
  return view.seats
    .filter((seat) => seat.kind === "other" && !seat.isDone && !seat.hasLeft)
    .map((seat) => playerNameOf(playerNames, seat.seat));
}

export function RightColumn(props: Props) {
  const { view, seat, playerNames, pendingActions, onAction } = props;
  const { choice, selected, pressCard, clear, playSelected, sell } = useHandMoves(
    seat.hand,
    onAction,
  );
  const [dialog, setDialog] = useState<OpenDialog>("none");
  const isBusy = pendingActions.length > 0;
  const selectedDetails = seat.handDetails.find((details) => details.card === selected);
  return (
    <div className={styles["right"]}>
      <YourStatsPanel seat={seat} view={view} playerNames={playerNames} />
      <HandPanel
        handDetails={seat.handDetails}
        newCards={seat.newCards}
        choice={choice}
        pendingCards={pendingCardsOf(pendingActions)}
        onPressCard={pressCard}
      />
      <ActionsPanel
        seat={seat}
        isMarketPhase={view.phase === "market"}
        choice={choice}
        waitingFor={namesStillPlaying(view, playerNames)}
        isEndTurnPending={pendingActions.some(({ action }) => action.type === "end_turn")}
        isBusy={isBusy}
        onPlaySelected={playSelected}
        onSell={sell}
        onOpenDialog={setDialog}
        onAction={onAction}
      />
      <ProgressDialogs
        dialog={dialog}
        seat={seat}
        view={view}
        playerNames={playerNames}
        isBusy={isBusy}
        onAction={onAction}
        onClose={() => {
          setDialog("none");
        }}
      />
      {selectedDetails === undefined ? null : (
        <SelectedCardPanel
          details={selectedDetails}
          seat={seat}
          nextVoteTurn={view.nextVoteTurn}
          isBusy={isBusy}
          onPlay={playSelected}
          onClose={clear}
        />
      )}
    </div>
  );
}
