import type { QueueView } from "../../../shared/protocol/QueueView";
import type { RankedGameSize } from "../../../shared/RankedGameSize";
import { Button } from "../../components/Button";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { GameSizeToggles } from "./GameSizeToggles";
import { queueCountTexts } from "./queueCountTexts";
import styles from "./RankedQueue.module.css";
import type { RankedLock } from "./RankedLock";

type Props = {
  readonly queue: QueueView;
  readonly sizes: ReadonlyArray<RankedGameSize>;
  readonly lock: RankedLock | null;
  readonly error: IconText | null;
  readonly onToggle: (size: RankedGameSize) => void;
  readonly onJoin: () => void;
  readonly onLeave: () => void;
  readonly onSendConfirmationAgain: () => void;
};

const HOW_IT_WORKS =
  "A ranked game starts as soon as enough players for one of your game sizes are in the queue. Ranked games change ELO ratings.";
const WHILE_YOU_WAIT =
  "A match starts as soon as enough players for one of your game sizes are in it. You can change your game sizes while you wait. You cannot join a room while you wait.";

export function RankedQueuePanel(props: Props) {
  const { queue, lock, error } = props;
  const isInQueue = queue.own.kind !== "out";
  const isWaiting = queue.own.kind === "waiting";
  const counts = queueCountTexts(queue.counts);
  return (
    <section className={styles["panel"]} aria-labelledby="ranked-heading">
      <h2 id="ranked-heading" className={styles["title"]}>
        Ranked queue
      </h2>
      <p className={styles["headline"]}>{isWaiting ? "You are in the queue" : counts.total}</p>
      <p className={styles["text"]}>{counts.bySize}</p>
      <p className={styles["text"]}>
        {isWaiting ? `${counts.includingYou} ${WHILE_YOU_WAIT}` : HOW_IT_WORKS}
      </p>
      {isInQueue && queue.isSiteGameLimitReached ? (
        <p className={styles["lock"]}>
          <TextWithIcons text={REJECTION_MESSAGES.site_game_limit} />
        </p>
      ) : null}
      {lock?.text === null || lock === null ? null : (
        <p className={styles["lock"]}>
          <TextWithIcons text={lock.text} />
          {lock.canSendConfirmationAgain ? (
            <Button look="secondary" onClick={props.onSendConfirmationAgain}>
              Send it again
            </Button>
          ) : null}
        </p>
      )}
      <GameSizeToggles sizes={props.sizes} onToggle={props.onToggle} />
      <div className={styles["buttons"]}>
        {isInQueue ? (
          <Button look="danger" onClick={props.onLeave}>
            Leave the queue
          </Button>
        ) : (
          <Button look="success" isDisabled={lock !== null} onClick={props.onJoin}>
            Join the ranked queue
          </Button>
        )}
      </div>
      {error === null ? null : (
        <p role="alert" className={styles["error"]}>
          <TextWithIcons text={error} />
        </p>
      )}
    </section>
  );
}
