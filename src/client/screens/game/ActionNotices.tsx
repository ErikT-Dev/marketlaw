import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./ActionsPanel.module.css";
import type { HandChoice } from "./HandChoice";
import { OpenTurnDraw } from "./OpenTurnDraw";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { SellingNotice } from "./SellingNotice";

type Props = {
  readonly seat: OwnSeatView;
  readonly choice: HandChoice;
  readonly isBusy: boolean;
  readonly onAction: (action: ActionIntent) => void;
};

const OUT_OF_TIME_TEXT =
  "You are out of time. You can keep playing until the other players are done.";

export function ActionNotices({ seat, choice, isBusy, onAction }: Props) {
  const isTurnDrawOpen = seat.hasHadMarketGo && seat.turnDrawRejection === null;
  return (
    <>
      {seat.isOutOfTime ? <p className={styles["notice"]}>{OUT_OF_TIME_TEXT}</p> : null}
      {isTurnDrawOpen ? (
        <OpenTurnDraw
          isBusy={isBusy}
          onChooseSector={(sector) => {
            onAction({ type: "turn_draw", choice: { option: "B", sector } });
          }}
        />
      ) : null}
      {seat.sellRejection === "action_limit_reached" ? (
        <p className={styles["notice"]}>
          <TextWithIcons text={REJECTION_MESSAGES.action_limit_reached} />
        </p>
      ) : null}
      {choice.mode === "selling" ? <SellingNotice marked={choice.marked.length} /> : null}
    </>
  );
}
