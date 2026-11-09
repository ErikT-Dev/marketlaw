import type { AskingView } from "../../../shared/protocol/AskingView";
import { Button } from "../../components/Button";
import { clockText } from "../../components/clockText";
import { Modal } from "../../components/Modal";
import styles from "./Lobby.module.css";

type Props = {
  readonly asking: AskingView;
  readonly isRematch: boolean;
  readonly playerCount: number;
  readonly myName: string;
  readonly now: number;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

function textsOf(isRematch: boolean, playerCount: number) {
  const count = String(playerCount);
  return isRematch
    ? {
        title: "Accept a rematch?",
        start: `A new casual game starts from the beginning when all ${count} players in the room accept.`,
        refusal:
          "If anyone declines or does not answer in time, no game starts and the room stays as it is.",
      }
    : {
        title: "The room is full: accept the game?",
        start: `The game starts when all ${count} players accept.`,
        refusal:
          "If you decline or do not accept in time, you are removed from the room and can join it again after 2 minutes. Players who accepted keep waiting.",
      };
}

export function AcceptDialog(props: Props) {
  const { asking, myName, now, onAccept, onDecline } = props;
  const hasAccepted = asking.acceptedNames.includes(myName);
  const texts = textsOf(props.isRematch, props.playerCount);
  return (
    <Modal title={texts.title} size="large">
      <div className={styles["dialogBody"]}>
        <p className={styles["strong"]} role="timer">
          {clockText(asking.deadline - now)} left to accept. {texts.start}
        </p>
        <p className={styles["accepted"]}>
          {asking.acceptedNames.length === 0
            ? "Nobody has accepted yet."
            : `Accepted so far: ${asking.acceptedNames.join(", ")}`}
        </p>
        <p className={styles["small"]}>{texts.refusal}</p>
        <div className={styles["dialogButtons"]}>
          <Button look="danger" onClick={onDecline}>
            Decline
          </Button>
          <Button look="success" onClick={onAccept} isDisabled={hasAccepted}>
            {hasAccepted ? "Accepted" : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
