import styles from "./Account.module.css";

type Props = {
  readonly isInGame: boolean;
};

const WHAT_IS_REMOVED =
  "Your email address and password are removed, your username becomes free, and your game records show “Deleted player”.";

export function DeleteAccountWarning({ isInGame }: Props) {
  return isInGame ? (
    <>
      <p className={styles["leavingWarning"]}>
        You are in a game. Deleting your account counts as leaving it: you cannot come back and
        cannot win.
      </p>
      <p className={styles["warningDetail"]}>{WHAT_IS_REMOVED}</p>
    </>
  ) : (
    <p className={styles["warningText"]}>This cannot be undone. {WHAT_IS_REMOVED}</p>
  );
}
