import styles from "./QuestsPanel.module.css";

type Props = {
  readonly name: string;
  readonly canCompleteNow: boolean;
};

export function QuestPlayerName({ name, canCompleteNow }: Props) {
  if (!canCompleteNow) {
    return <span className={styles["player"]}>{name}</span>;
  }
  return (
    <span className={styles["playerWhoCanComplete"]}>
      {name}
      <span className={styles["visuallyHidden"]}> could complete it now</span>
    </span>
  );
}
