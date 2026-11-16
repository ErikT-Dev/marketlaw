import { RANKED_GAME_SIZES } from "../../../shared/RANKED_GAME_SIZES";
import type { RankedGameSize } from "../../../shared/RankedGameSize";
import styles from "./RankedQueue.module.css";

type Props = {
  readonly sizes: ReadonlyArray<RankedGameSize>;
  readonly onToggle: (size: RankedGameSize) => void;
};

export function GameSizeToggles({ sizes, onToggle }: Props) {
  return (
    <fieldset className={styles["sizes"]}>
      <legend className={styles["label"]}>Game sizes</legend>
      {RANKED_GAME_SIZES.map((size) => {
        const isChosen = sizes.includes(size);
        return (
          <label key={size} className={styles["toggle"]}>
            <input
              type="checkbox"
              role="switch"
              className={styles["switch"]}
              checked={isChosen}
              disabled={isChosen && sizes.length === 1}
              onChange={() => {
                onToggle(size);
              }}
            />
            {size} players
          </label>
        );
      })}
    </fieldset>
  );
}
