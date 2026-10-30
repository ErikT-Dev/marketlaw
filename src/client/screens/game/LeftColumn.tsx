import type { PlayerView } from "../../../shared/PlayerView";
import { DrawLogPanel } from "./DrawLogPanel";
import styles from "./GamePage.module.css";
import { OpponentsPanel } from "./OpponentsPanel";

type Props = {
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
};

export function LeftColumn({ view, playerNames }: Props) {
  return (
    <div className={styles["left"]}>
      <OpponentsPanel view={view} playerNames={playerNames} />
      <DrawLogPanel drawLog={view.drawLog} playerNames={playerNames} />
    </div>
  );
}
