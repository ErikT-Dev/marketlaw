import type { PlayerId } from "../../shared/PlayerId";
import { matchHistoryHash } from "./matchHistoryHash";
import styles from "./UsernameLink.module.css";

type Props = {
  readonly playerId: PlayerId;
  readonly username: string;
};

export function UsernameLink({ playerId, username }: Props) {
  return (
    <a className={styles["usernameLink"]} href={matchHistoryHash(playerId)}>
      {username}
    </a>
  );
}
