import type { RecordName } from "../../../shared/api/RecordName";
import styles from "./Records.module.css";
import { UsernameLink } from "./UsernameLink";

type Props = {
  readonly name: RecordName;
};

export function RecordNameLink({ name }: Props) {
  return name.kind === "player" ? (
    <UsernameLink playerId={name.playerId} username={name.username} />
  ) : (
    <span className={styles["deletedPlayer"]}>Deleted player</span>
  );
}
