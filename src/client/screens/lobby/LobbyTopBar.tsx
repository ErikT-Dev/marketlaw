import styles from "./Lobby.module.css";

type Props = {
  readonly name: string | null;
};

export function LobbyTopBar({ name }: Props) {
  return (
    <header className={styles["topBar"]}>
      <h1 className={styles["title"]}>MARKET LAW</h1>
      {name === null ? null : (
        <div className={styles["userBox"]} aria-label="Your account">
          <span className={styles["avatar"]} aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <span>
            <strong className={styles["userName"]}>{name}</strong>
            <span className={styles["small"]}>Guest</span>
          </span>
        </div>
      )}
    </header>
  );
}
