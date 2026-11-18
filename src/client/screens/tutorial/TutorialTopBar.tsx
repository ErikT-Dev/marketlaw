import type { PlayerView } from "../../../shared/PlayerView";
import styles from "../game/GameTopBar.module.css";
import { PHASE_NAMES } from "../game/PHASE_NAMES";
import { phaseClassOf } from "../game/phaseClassOf";
import { GameMenu } from "../menu/GameMenu";
import { LeaveTutorialButton } from "./LeaveTutorialButton";

type Props = {
  readonly view: PlayerView;
  readonly onLeave: () => void;
  readonly isConnected: boolean;
};

export function TutorialTopBar({ view, onLeave, isConnected }: Props) {
  return (
    <header className={styles["topBar"]}>
      <div className={styles["turnInfo"]}>
        <GameMenu place="game" buttonLabel="Menu" />
        <h1 className={styles["turn"]}>Tutorial · turn {view.turn}</h1>
        <span className={styles[phaseClassOf(view)]}>{PHASE_NAMES[view.phase]}</span>
      </div>
      <div className={styles["right"]}>
        <LeaveTutorialButton onLeave={onLeave} isDisabled={!isConnected} />
      </div>
    </header>
  );
}
