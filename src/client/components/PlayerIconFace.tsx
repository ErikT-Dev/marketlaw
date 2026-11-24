import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import { playerIconPictureUrl } from "../icons/playerIconPictureUrl";
import styles from "./PlayerIcon.module.css";

type Props = {
  readonly icon: PlayerIconChoice;
};

export function PlayerIconFace({ icon }: Props) {
  return (
    <span
      className={styles["picture"]}
      aria-hidden="true"
      style={{
        backgroundColor: icon.color,
        maskImage: `url("${playerIconPictureUrl(icon.picture)}")`,
      }}
    />
  );
}
