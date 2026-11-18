import { playerIconLetterOf } from "./playerIconLetterOf";
import styles from "./PlayerIcon.module.css";

type Props = {
  readonly name: string;
  readonly username: string;
  readonly colorIndex: number;
  readonly isMarked?: boolean;
};

export function PlayerIcon({ name, username, colorIndex, isMarked = false }: Props) {
  const classes = `${styles["icon"] ?? ""} ${isMarked ? (styles["marked"] ?? "") : ""}`;
  return (
    <button
      type="button"
      className={classes}
      aria-label={name}
      style={{ background: `var(--color-player-icon-${String(colorIndex)})` }}
    >
      <span aria-hidden="true">{playerIconLetterOf(username)}</span>
      <span className={styles["tooltip"]} aria-hidden="true">
        {name}
      </span>
    </button>
  );
}
