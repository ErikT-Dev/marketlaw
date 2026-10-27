import { useState } from "react";
import styles from "./Screens.module.css";

type Props = {
  readonly onCreate: (size: 2 | 3 | 4) => void;
};

const SIZES = [2, 3, 4] as const;

export function CreateRoomForm({ onCreate }: Props) {
  const [size, setSize] = useState<2 | 3 | 4>(2);
  return (
    <section className={styles["panel"]} aria-label="Create a room">
      <div className={styles["row"]}>
        <label className={styles["row"]}>
          Players
          <select
            className={styles["select"]}
            value={size}
            onChange={(event) => {
              setSize(SIZES.find((option) => String(option) === event.target.value) ?? 2);
            }}
          >
            {SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles["button"]}
          type="button"
          onClick={() => {
            onCreate(size);
          }}
        >
          Create room
        </button>
      </div>
    </section>
  );
}
