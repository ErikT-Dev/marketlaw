import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import { PlayerIconFace } from "../../components/PlayerIconFace";
import { playerIconPictureLabel } from "../../icons/playerIconPictureLabel";
import styles from "./IconPicker.module.css";

type Props = {
  readonly icon: PlayerIconChoice;
  readonly isChosen: boolean;
  readonly onChoose: () => void;
};

export function IconPictureButton({ icon, isChosen, onChoose }: Props) {
  return (
    <button
      type="button"
      className={styles["pictureButton"]}
      aria-label={playerIconPictureLabel(icon.picture)}
      aria-pressed={isChosen}
      style={{ background: icon.background }}
      onClick={onChoose}
    >
      <PlayerIconFace icon={icon} />
    </button>
  );
}
