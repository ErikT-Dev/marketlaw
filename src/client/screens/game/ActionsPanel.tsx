import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { ActionNotices } from "./ActionNotices";
import styles from "./ActionsPanel.module.css";
import { counted } from "./counted";
import { DoneBanner } from "./DoneBanner";
import { Highlighted } from "./Highlighted";
import { MarketPhaseNotice } from "./MarketPhaseNotice";
import type { HandChoice } from "./HandChoice";
import type { OpenDialog } from "./OpenDialog";
import { ProgressButtons } from "./ProgressButtons";
import { RedrawHandButton } from "./RedrawHandButton";

type Props = {
  readonly seat: OwnSeatView;
  readonly isMarketPhase: boolean;
  readonly choice: HandChoice;
  readonly waitingFor: ReadonlyArray<string>;
  readonly isEndTurnPending: boolean;
  readonly isBusy: boolean;
  readonly onPlaySelected: () => void;
  readonly onSell: () => void;
  readonly onOpenDialog: (dialog: OpenDialog) => void;
  readonly onAction: (action: ActionIntent) => void;
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
  if (props.isMarketPhase) {
    return <MarketPhaseNotice />;
  }
  if (seat.isDone) {
    return <DoneBanner waitingFor={waitingFor} />;
  }
  const marked = choice.mode === "selling" ? choice.marked.length : 0;
  return (
    <Panel title="Actions">
      <ActionNotices seat={seat} choice={choice} isBusy={isBusy} onAction={props.onAction} />
      <div className={styles["buttons"]}>
        <RedrawHandButton seat={seat} isBusy={isBusy} onAction={props.onAction} />
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
          onClick={() => {
            props.onAction({ type: "undo" });
          }}
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
        <Highlighted part={{ kind: "button", button: "end_turn" }}>
          <Button
            look="success"
            isDisabled={isBusy || seat.endTurnRejection !== null}
            loadingLabel={isEndTurnPending ? "Waiting for the server…" : null}
            highlightReason={seat.hasPlayedThisTurn ? "You have played a card this turn" : null}
            onClick={() => {
              props.onAction({ type: "end_turn" });
            }}
          >
            End turn
          </Button>
        </Highlighted>
      </div>
    </Panel>
  );
}
