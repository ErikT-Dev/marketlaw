import type { AskingView } from "../../../shared/protocol/AskingView";
import { Button } from "../../components/Button";
import { clockText } from "../../components/clockText";
import { Modal } from "../../components/Modal";
import styles from "./Lobby.module.css";

type Props = {
  readonly asking: AskingView;
  readonly size: number;
  readonly myName: string;
  readonly now: number;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

export function AcceptDialog({ asking, size, myName, now, onAccept, onDecline }: Props) {
  const hasAccepted = asking.acceptedNames.includes(myName);
  return (
    <Modal title="The room is full: accept the game?" size="large">
      <div className={styles["dialogBody"]}>
        <p className={styles["strong"]} role="timer">
          {clockText(asking.deadline - now)} left to accept. The game starts when all {String(size)}{" "}
          players accept.
        </p>
        <p className={styles["accepted"]}>
          {asking.acceptedNames.length === 0
            ? "Nobody has accepted yet."
            : `Accepted so far: ${asking.acceptedNames.join(", ")}`}
        </p>
        <p className={styles["small"]}>
          If you decline or do not accept in time, you are removed from the room and can join it
          again after 2 minutes. Players who accepted keep waiting.
        </p>
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
