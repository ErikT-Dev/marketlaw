import type { QuestName } from "../../../shared/catalogue/QuestName";
import { turnsOnTableOf } from "../../../shared/turnsOnTableOf";
import styles from "./QuestTurnsLeftBox.module.css";
import type { QuestTurnsLeftLook } from "./QuestTurnsLeftLook";
import { questTurnsLeftLookOf } from "./questTurnsLeftLookOf";

type Props = {
  readonly quest: QuestName;
  readonly turnsLeft: number;
};

const LOOK_CLASSES: Readonly<Record<QuestTurnsLeftLook, string | undefined>> = {
  full_time: styles["fullTime"],
  above_half: styles["aboveHalf"],
  half_or_less: styles["halfOrLess"],
  last_turn: styles["lastTurn"],
};

export function QuestTurnsLeftBox({ quest, turnsLeft }: Props) {
  const look = questTurnsLeftLookOf(turnsLeft, turnsOnTableOf(quest));
  const label = turnsLeft === 1 ? "turn left" : "turns left";
  return (
    <div
      className={`${styles["box"] ?? ""} ${LOOK_CLASSES[look] ?? ""}`}
      role="img"
      aria-label={`${String(turnsLeft)} ${label}`}
    >
      <span className={styles["number"]}>{turnsLeft}</span>
      <span className={styles["label"]}>{label}</span>
    </div>
  );
}
