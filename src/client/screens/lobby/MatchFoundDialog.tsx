import type { RankedGameSize } from "../../../shared/RankedGameSize";
import { Button } from "../../components/Button";
import { clockText } from "../../components/clockText";
import type { IconText } from "../../components/IconText";
import { Modal } from "../../components/Modal";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./Lobby.module.css";

type Props = {
  readonly size: RankedGameSize;
  readonly timeLeftMs: number;
  readonly isConfirmed: boolean;
  readonly error: IconText | null;
  readonly onConfirm: () => void;
  readonly onDecline: () => void;
};

export function MatchFoundDialog({
  size,
  timeLeftMs,
  isConfirmed,
  error,
  onConfirm,
  onDecline,
}: Props) {
  const timeLeft = clockText(timeLeftMs);
  return (
    <Modal title={`${String(size)}-player match found!`} size="large">
      <div className={styles["dialogBody"]}>
        <p className={styles["strong"]}>
          A ranked game with {size} players is ready. Confirm that you will play.
        </p>
        {isConfirmed ? (
          <p className={styles["small"]} role="timer">
            Confirmed. Waiting for the other players. {timeLeft} left.
          </p>
        ) : (
          <p className={styles["small"]} role="timer">
            {timeLeft} left to confirm. If you decline or do not confirm in time, you leave the
            queue and can join again after 2 minutes.
          </p>
        )}
        {error === null ? null : (
          <p role="alert" className={styles["error"]}>
            <TextWithIcons text={error} />
          </p>
        )}
        {isConfirmed ? null : (
          <div className={styles["dialogButtons"]}>
            <Button look="danger" onClick={onDecline}>
              Decline
            </Button>
            <Button look="success" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
