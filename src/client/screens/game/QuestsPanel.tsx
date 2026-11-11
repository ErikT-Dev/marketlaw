import type { QuestName } from "../../../shared/catalogue/QuestName";
import type { QuestCompletedLastTurn } from "../../../shared/QuestCompletedLastTurn";
import type { QuestPlaceView } from "../../../shared/QuestPlaceView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { HelpButton } from "../../components/HelpButton";
import { Panel } from "../../components/Panel";
import { QuestCard } from "./QuestCard";
import { QuestsCompletedLastTurnTable } from "./QuestsCompletedLastTurnTable";
import styles from "./QuestsPanel.module.css";
import { QUESTS_HELP } from "./QUESTS_HELP";

type Props = {
  readonly quests: ReadonlyArray<QuestPlaceView>;
  readonly completedLastTurn: ReadonlyArray<QuestCompletedLastTurn>;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly isBusy: boolean;
  readonly onComplete: (quest: QuestName) => void;
};

export function QuestsPanel({
  quests,
  completedLastTurn,
  viewer,
  playerNames,
  isBusy,
  onComplete,
}: Props) {
  const table = (
    <ul className={styles["table"]} aria-label="Quests table">
      {quests.map((place, index) => (
        <li key={place.quest ?? `empty ${String(index)}`}>
          {place.quest === null ? (
            <div className={`${styles["card"] ?? ""} ${styles["empty"] ?? ""}`}>Empty place</div>
          ) : (
            <QuestCard
              place={place}
              viewer={viewer}
              playerNames={playerNames}
              isBusy={isBusy}
              onComplete={() => {
                onComplete(place.quest);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
  return (
    <Panel title="Quests" help={<HelpButton name="How quests work" text={QUESTS_HELP} />}>
      {completedLastTurn.length === 0 ? (
        table
      ) : (
        <div className={styles["withCompletedLastTurn"]}>
          {table}
          <QuestsCompletedLastTurnTable completed={completedLastTurn} playerNames={playerNames} />
        </div>
      )}
    </Panel>
  );
}
