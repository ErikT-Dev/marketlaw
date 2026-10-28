import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { PendingAction } from "../../store/PendingAction";
import { ActionsPanel } from "./ActionsPanel";
import styles from "./GamePage.module.css";
import { HandPanel } from "./HandPanel";
import { pendingCardsOf } from "./pendingCardsOf";
import { playerNameOf } from "./playerNameOf";
import { SelectedCardPanel } from "./SelectedCardPanel";
import { useHandChoice } from "./useHandChoice";
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

export function RightColumn({ view, seat, playerNames, pendingActions, onAction }: Props) {
  const { choice, pressCard, startSelling, clear } = useHandChoice(seat.hand);
  const isBusy = pendingActions.length > 0;
  const selected = choice.mode === "choosing" ? choice.selected : null;
  const selectedDetails = seat.handDetails.find((details) => details.card === selected);
  function playSelected() {
    if (selected !== null) {
      onAction({ type: "play_card", card: selected });
    }
    clear();
  }
  function sell() {
    if (choice.mode === "choosing") {
      startSelling();
      return;
    }
    const [first, ...rest] = choice.marked;
    if (first !== undefined) {
      onAction({ type: "sell", cards: [first, ...rest] });
    }
    clear();
  }
  return (
    <div className={styles["right"]}>
      <YourStatsPanel seat={seat} />
      <HandPanel
        handDetails={seat.handDetails}
        choice={choice}
        pendingCards={pendingCardsOf(pendingActions)}
        onPressCard={pressCard}
      />
      <ActionsPanel
        seat={seat}
        choice={choice}
        waitingFor={namesStillPlaying(view, playerNames)}
        isEndTurnPending={pendingActions.some(({ action }) => action.type === "end_turn")}
        isBusy={isBusy}
        onPlaySelected={playSelected}
        onSell={sell}
        onEndTurn={() => {
          onAction({ type: "end_turn" });
        }}
      />
      {selectedDetails === undefined ? null : (
        <SelectedCardPanel
          details={selectedDetails}
          seat={seat}
          isBusy={isBusy}
          onPlay={playSelected}
          onClose={clear}
        />
      )}
    </div>
  );
}
