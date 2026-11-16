import type { Sector } from "../../../shared/catalogue/Sector";
import styles from "./ActionsPanel.module.css";
import { SectorButtons } from "./SectorButtons";

type Props = {
  readonly isBusy: boolean;
  readonly onChooseSector: (sector: Sector) => void;
};

export function OpenTurnDraw({ isBusy, onChooseSector }: Props) {
  return (
    <div className={styles["openTurnDraw"]} role="group" aria-label="Turn draw left open">
      <p className={styles["openTurnDrawText"]}>
        <strong>Your time ran out on your market go. Choose a sector for your 2 cards.</strong> If
        you end your turn without choosing, a random sector is used.
      </p>
      <SectorButtons isBusy={isBusy} onChoose={onChooseSector} isCompact />
    </div>
  );
}
