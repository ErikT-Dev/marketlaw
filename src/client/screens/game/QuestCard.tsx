import { useContext, useId } from "react";
import { questOf } from "../../../shared/ruleFiles/questOf";
import type { QuestPlaceView } from "../../../shared/QuestPlaceView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Button } from "../../components/Button";
import { counted } from "./counted";
import { playerIconOf } from "./playerIconOf";
import { PlayerIcons } from "./PlayerIcons";
import { playerNameOf } from "./playerNameOf";
import { QuestNeedsLine } from "./QuestNeedsLine";
import { QuestProgressLine } from "./QuestProgressLine";
import { QuestRewardParts } from "./QuestRewardParts";
import styles from "./QuestsPanel.module.css";
import { Highlighted } from "./Highlighted";

type Props = {
  readonly place: Exclude<QuestPlaceView, { readonly quest: null }>;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly isBusy: boolean;
  readonly onComplete: () => void;
};

export function QuestCard({ place, viewer, playerNames, isBusy, onComplete }: Props) {
  const playerIcons = useContext(PlayerIcons);
  const nameId = useId();
  const { tier, terms } = questOf(place.quest);
  const { needs, reward } = terms;
  const isReady = place.completeRejection === null;
  const isCompleted = place.progress.some(
    ({ seat, isCompleted }) => seat === viewer && isCompleted,
  );
  const progressInOrder = [
    ...place.progress.filter(({ seat }) => seat === viewer),
    ...place.progress.filter(({ seat }) => seat !== viewer),
  ];
  const classes = [
    styles["card"],
    isReady ? styles["ready"] : "",
    isCompleted ? styles["completed"] : "",
  ].join(" ");
  return (
    <Highlighted part={{ kind: "quest", quest: place.quest }} isBlock>
      <section className={classes} aria-labelledby={nameId}>
        <h3 id={nameId} className={styles["name"]}>
          {place.quest}
        </h3>
        <p className={styles["subtitle"]}>
          Tier {tier} · {counted(place.turnsLeft, "turn")} left
        </p>
        <QuestNeedsLine needs={needs} />
        <p className={`${styles["line"] ?? ""} ${styles["reward"] ?? ""}`}>
          Reward:
          <QuestRewardParts reward={reward} />
        </p>
        <ul className={styles["progressList"]} aria-label={`Progress on ${place.quest}`}>
          {progressInOrder.map((progress) => (
            <QuestProgressLine
              key={progress.seat}
              name={progress.seat === viewer ? "You" : playerNameOf(playerNames, progress.seat)}
              icon={playerIconOf(playerIcons, progress.seat)}
              progress={progress}
              needs={needs}
              isViewer={progress.seat === viewer}
            />
          ))}
        </ul>
        {isReady ? (
          <Button look="success" isDisabled={isBusy} onClick={onComplete}>
            Complete
          </Button>
        ) : null}
      </section>
    </Highlighted>
  );
}
