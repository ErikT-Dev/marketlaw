import styles from "./Lobby.module.css";

type Props = {
  readonly name: string;
  readonly isGuest: boolean;
};

export function UserBox({ name, isGuest }: Props) {
  return (
    <div className={styles["userBox"]} aria-label="Your account">
      <span className={styles["avatar"]} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <span>
        <strong className={styles["userName"]}>{name}</strong>
        {isGuest ? <span className={styles["small"]}>Guest</span> : null}
      </span>
    </div>
  );
}
