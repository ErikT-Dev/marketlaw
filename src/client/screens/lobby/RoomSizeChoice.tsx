import styles from "./Lobby.module.css";

type Props = {
  readonly label: string;
  readonly size: number;
  readonly smallest: number;
  readonly isEnabled: boolean;
  readonly onChoose: (size: 2 | 3 | 4) => void;
};

const SIZES = [2, 3, 4] as const;

export function RoomSizeChoice({ label, size, smallest, isEnabled, onChoose }: Props) {
  return (
    <fieldset className={styles["sizeChoice"]}>
      <legend className={styles["label"]}>{label}</legend>
      {SIZES.map((choice) => (
        <button
          key={choice}
          type="button"
          className={styles["sizeButton"]}
          aria-pressed={choice === size}
          disabled={!isEnabled || choice < smallest}
          onClick={() => {
            onChoose(choice);
          }}
        >
          {choice} players
        </button>
      ))}
    </fieldset>
  );
}
