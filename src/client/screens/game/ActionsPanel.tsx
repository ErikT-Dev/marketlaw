import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./ActionsPanel.module.css";
import { counted } from "./counted";
import { DoneBanner } from "./DoneBanner";
import { GameOverNotice } from "./GameOverNotice";
import { MarketPhaseNotice } from "./MarketPhaseNotice";
import type { HandChoice } from "./HandChoice";
import type { OpenDialog } from "./OpenDialog";
import { ProgressButtons } from "./ProgressButtons";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { SellingNotice } from "./SellingNotice";

type Props = {
  readonly seat: OwnSeatView;
  readonly isMarketPhase: boolean;
  readonly choice: HandChoice;
  readonly waitingFor: ReadonlyArray<string>;
  readonly isEndTurnPending: boolean;
  readonly isBusy: boolean;
  readonly onPlaySelected: () => void;
  readonly onSell: () => void;
  readonly onUndo: () => void;
  readonly onEndTurn: () => void;
  readonly onOpenDialog: (dialog: OpenDialog) => void;
  readonly onShowResult: (() => void) | null;
};

function sellLabel(choice: HandChoice): string {
  if (choice.mode === "choosing") {
    return "Sell cards";
  }
  const count = choice.marked.length;
  return count === 0 ? "Cancel selling" : `Sell ${counted(count, "card")}`;
}

function canPlaySelected(seat: OwnSeatView, choice: HandChoice): boolean {
  const selected = choice.mode === "choosing" ? choice.selected : null;
  return seat.handDetails.some(
    (details) => details.card === selected && details.playRejection === null,
  );
}

export function ActionsPanel(props: Props) {
  const { seat, choice, waitingFor, isEndTurnPending, isBusy } = props;
  if (props.onShowResult !== null) {
    return <GameOverNotice onShowResult={props.onShowResult} />;
  }
  if (props.isMarketPhase) {
    return <MarketPhaseNotice />;
  }
  if (seat.isDone) {
    return <DoneBanner waitingFor={waitingFor} />;
  }
  const marked = choice.mode === "selling" ? choice.marked.length : 0;
  return (
    <Panel title="Actions">
      {seat.sellRejection === "action_limit_reached" ? (
        <p className={styles["notice"]}>
          <TextWithIcons text={REJECTION_MESSAGES.action_limit_reached} />
        </p>
      ) : null}
      {choice.mode === "selling" ? <SellingNotice marked={marked} /> : null}
      <div className={styles["buttons"]}>
        <Button
          look="menu"
          isDisabled={isBusy || !canPlaySelected(seat, choice)}
          onClick={props.onPlaySelected}
        >
          Play card
        </Button>
        <Button
          look="menu"
          isDisabled={isBusy || seat.undoRejection !== null}
          onClick={props.onUndo}
        >
          Undo
        </Button>
        <Button
          look="warning"
          isDisabled={
            !(choice.mode === "selling" && marked === 0) && (isBusy || seat.sellRejection !== null)
          }
          onClick={props.onSell}
        >
          {sellLabel(choice)}
        </Button>
        <ProgressButtons seat={seat} isBusy={isBusy} onOpenDialog={props.onOpenDialog} />
        <Button
          look="success"
          isDisabled={isBusy || seat.endTurnRejection !== null}
          loadingLabel={isEndTurnPending ? "Waiting for the server…" : null}
          onClick={props.onEndTurn}
        >
          End turn
        </Button>
      </div>
    </Panel>
  );
}
