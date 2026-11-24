import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import { PlayerIcon } from "../../components/PlayerIcon";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly name: string;
  readonly icon: PlayerIconChoice | null;
  readonly canCompleteNow: boolean;
};

export function QuestPlayerName({ name, icon, canCompleteNow }: Props) {
  return (
    <span className={styles["player"]}>
      <PlayerIcon name={name} icon={icon} isMarked={canCompleteNow} />
      {canCompleteNow ? (
        <span className={styles["visuallyHidden"]}> could complete it now</span>
      ) : null}
    </span>
  );
}
