import { PlayerIcon } from "../../components/PlayerIcon";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly name: string;
  readonly username: string;
  readonly colorIndex: number;
  readonly canCompleteNow: boolean;
};

export function QuestPlayerName({ name, username, colorIndex, canCompleteNow }: Props) {
  return (
    <span className={styles["player"]}>
      <PlayerIcon
        name={name}
        username={username}
        colorIndex={colorIndex}
        isMarked={canCompleteNow}
      />
      {canCompleteNow ? (
        <span className={styles["visuallyHidden"]}> could complete it now</span>
      ) : null}
    </span>
  );
}
