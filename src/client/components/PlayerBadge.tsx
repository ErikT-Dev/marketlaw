import { PlayerNameLink } from "./PlayerNameLink";
import type { PlayerId } from "../../shared/PlayerId";
import styles from "./Badge.module.css";
import type { PlayerStatus } from "./PlayerStatus";

type Props = {
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly status: PlayerStatus;
  readonly rating?: number;
  readonly isFirstPlayer?: boolean;
};

const STATUS_TEXT: Readonly<Record<PlayerStatus, string>> = {
  online: "online",
  inGame: "in a game",
  away: "away",
  done: "done",
  left: "left",
  none: "",
};
const STATUS_COLOR: Readonly<Record<PlayerStatus, string>> = {
  online: "var(--color-status-online)",
  inGame: "var(--color-status-in-game)",
  away: "var(--color-status-away)",
  done: "var(--color-status-done)",
  left: "var(--color-status-left)",
  none: "var(--color-status-online)",
};

export function PlayerBadge({ name, playerId, status, rating, isFirstPlayer = false }: Props) {
  const color = STATUS_COLOR[status];
  return (
    <span className={`${styles["badge"] ?? ""} ${status === "left" ? (styles["left"] ?? "") : ""}`}>
      <span className={styles["dot"]} style={{ background: color }} aria-hidden="true" />
      <span className={styles["name"]}>
        <PlayerNameLink name={name} playerId={playerId} />
      </span>
      {rating === undefined ? null : <span className={styles["rating"]}>{rating}</span>}
      {status === "none" ? null : (
        <span className={styles["status"]} {...(status === "left" ? {} : { style: { color } })}>
          {STATUS_TEXT[status]}
        </span>
      )}
      {isFirstPlayer ? <span className={styles["firstPlayer"]}>first player</span> : null}
    </span>
  );
}
