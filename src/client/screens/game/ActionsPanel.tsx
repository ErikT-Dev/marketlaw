import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { FUNDS_PER_SOLD_CARD } from "../../../shared/FUNDS_PER_SOLD_CARD";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import styles from "./ActionsPanel.module.css";
import { counted } from "./counted";
import { DoneBanner } from "./DoneBanner";
import type { HandChoice } from "./HandChoice";
import type { OpenDialog } from "./OpenDialog";
import { ProgressButtons } from "./ProgressButtons";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";

type Props = {
  readonly seat: OwnSeatView;
  readonly choice: HandChoice;
  readonly waitingFor: ReadonlyArray<string>;
  readonly isEndTurnPending: boolean;
  readonly isBusy: boolean;
  readonly onPlaySelected: () => void;
  readonly onSell: () => void;
  readonly onEndTurn: () => void;
  readonly onOpenDialog: (dialog: OpenDialog) => void;
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
  if (seat.isDone) {
    return <DoneBanner waitingFor={waitingFor} />;
  }
  const marked = choice.mode === "selling" ? choice.marked.length : 0;
  return (
    <Panel title="Actions">
      {seat.sellRejection === "action_limit_reached" ? (
        <p className={styles["notice"]}>{REJECTION_MESSAGES.action_limit_reached}</p>
      ) : null}
      {choice.mode === "selling" ? (
        <p className={styles["notice"]}>
          {`Selling: click cards in your hand to mark them, then Sell ${counted(marked, "card")} for ${counted(marked * FUNDS_PER_SOLD_CARD, "fund")}. Sold cards cannot be taken back.`}
        </p>
      ) : null}
      <div className={styles["buttons"]}>
        <Button
          look="menu"
          isDisabled={isBusy || !canPlaySelected(seat, choice)}
          onClick={props.onPlaySelected}
        >
          Play card
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
