import { questOf } from "../../../shared/ruleFiles/questOf";
import type { QuestCompletedLastTurn } from "../../../shared/QuestCompletedLastTurn";
import { playerNameOf } from "./playerNameOf";
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
          <th scope="col">Completed by</th>
        </tr>
      </thead>
      <tbody>
        {completed.map(({ quest, seats }) => (
          <tr key={quest}>
            <th scope="row">{quest}</th>
            <td>{questOf(quest).tier}</td>
            <td>{seats.map((seat) => playerNameOf(playerNames, seat)).join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
