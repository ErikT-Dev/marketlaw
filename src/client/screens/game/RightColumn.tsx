import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { PendingAction } from "../../store/PendingAction";
import { useState } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { BigCardBesideHand } from "./BigCardBesideHand";
import type { OpenDialog } from "./OpenDialog";
import { ProgressDialogs } from "./ProgressDialogs";
import styles from "./GamePage.module.css";
import { HandPanel } from "./HandPanel";
import type { LookedAtCard } from "./LookedAtCard";
import { pendingCardsOf } from "./pendingCardsOf";
import { playerNameOf } from "./playerNameOf";
import { useHandBesideLookedAt } from "./useHandBesideLookedAt";
import { YourStatsPanel } from "./YourStatsPanel";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly lookedAt: LookedAtCard | null;
  readonly onLookAt: (lookedAt: LookedAtCard | null) => void;
  readonly onAction: (action: ActionIntent) => void;
};

function namesStillPlaying(view: PlayerView, playerNames: ReadonlyArray<string>) {
  return view.seats
    .filter((seat) => seat.kind === "other" && !seat.isDone && !seat.hasLeft)
    .map((seat) => playerNameOf(playerNames, seat.seat));
}

export function RightColumn(props: Props) {
  const { view, seat, playerNames, pendingActions, lookedAt, onLookAt, onAction } = props;
  const { choice, selected, pressCard, clear, playSelected, sell, sellSelected } =
    useHandBesideLookedAt(seat.hand, onAction, lookedAt, onLookAt);
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
        isBusy={isBusy}
        onAction={onAction}
        onClose={() => {
          setDialog("none");
        }}
      />
      <BigCardBesideHand
        details={selectedDetails}
        lookedAt={lookedAt}
        seat={seat}
        nextVoteTurn={view.nextVoteTurn}
        isBusy={isBusy}
        isOverStatsAndHand={view.phase === "market"}
        onPlay={playSelected}
        onSell={sellSelected}
        onClose={clear}
        onLookAt={onLookAt}
      />
    </div>
  );
}
