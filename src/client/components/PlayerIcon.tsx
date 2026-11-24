import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import styles from "./PlayerIcon.module.css";
import { PlayerIconFace } from "./PlayerIconFace";

type Props = {
  readonly name: string;
  readonly icon: PlayerIconChoice | null;
  readonly isMarked?: boolean;
};

export function PlayerIcon({ name, icon, isMarked = false }: Props) {
  const classes = `${styles["icon"] ?? ""} ${isMarked ? (styles["marked"] ?? "") : ""}`;
  return (
    <button
      type="button"
      className={classes}
      aria-label={name}
      style={icon === null ? undefined : { background: icon.background }}
    >
      {icon === null ? null : <PlayerIconFace icon={icon} />}
      <span className={styles["tooltip"]} aria-hidden="true">
        {name}
      </span>
    </button>
  );
}
