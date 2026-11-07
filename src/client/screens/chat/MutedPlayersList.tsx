import styles from "./RoomChatPanel.module.css";

type Props = {
  readonly mutedNames: ReadonlyArray<string>;
  readonly onUnmute: (playerName: string) => void;
};

export function MutedPlayersList({ mutedNames, onUnmute }: Props) {
  if (mutedNames.length === 0) {
    return null;
  }
  return (
    <ul className={styles["mutedList"]} aria-label="Muted players">
      {mutedNames.map((name) => (
        <li key={name} className={styles["muted"]}>
          <span>You muted {name}</span>
          <button
            type="button"
            className={styles["unmute"]}
            aria-label={`Unmute ${name}`}
            onClick={() => {
              onUnmute(name);
            }}
          >
            Unmute
          </button>
        </li>
      ))}
    </ul>
  );
}
