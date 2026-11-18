import { questOf } from "../../../shared/ruleFiles/questOf";
import type { QuestCompletedLastTurn } from "../../../shared/QuestCompletedLastTurn";
import { playerNameOf } from "./playerNameOf";
import { QuestNeedParts } from "./QuestNeedParts";
import { QuestRewardParts } from "./QuestRewardParts";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly completed: ReadonlyArray<QuestCompletedLastTurn>;
  readonly playerNames: ReadonlyArray<string>;
};

export function QuestsCompletedLastTurnTable({ completed, playerNames }: Props) {
  return (
    <table className={styles["completedLastTurn"]} aria-label="Completed last turn">
      <caption className={styles["completedLastTurnTitle"]}>Completed last turn</caption>
      <thead>
        <tr>
          <th scope="col">Quest</th>
          <th scope="col">Tier</th>
          <th scope="col">Requirement</th>
          <th scope="col">Reward</th>
          <th scope="col">Completed by</th>
        </tr>
      </thead>
      <tbody>
        {completed.map(({ quest, seats }) => {
          const { tier, terms } = questOf(quest);
          return (
            <tr key={quest}>
              <th scope="row">{quest}</th>
              <td>{tier}</td>
              <td>
                <span className={styles["completedLastTurnParts"]}>
                  <QuestNeedParts needs={terms.needs} />
                </span>
              </td>
              <td>
                <span className={styles["completedLastTurnParts"]}>
                  <QuestRewardParts reward={terms.reward} />
                </span>
              </td>
              <td>{seats.map((seat) => playerNameOf(playerNames, seat)).join(", ")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
