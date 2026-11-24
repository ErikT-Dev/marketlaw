import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import { PlayerIconFace } from "../../components/PlayerIconFace";
import { IconColorInput } from "./IconColorInput";
import styles from "./IconPicker.module.css";

type Props = {
  readonly choice: PlayerIconChoice;
  readonly onChange: (choice: PlayerIconChoice) => void;
};

export function IconColors({ choice, onChange }: Props) {
  return (
    <div className={styles["colors"]}>
      <IconColorInput
        label="Background colour"
        value={choice.background}
        onChange={(background) => {
          onChange({ ...choice, background });
        }}
      />
      <IconColorInput
        label="Picture colour"
        value={choice.color}
        onChange={(color) => {
          onChange({ ...choice, color });
        }}
      />
      <span
        className={styles["preview"]}
        role="img"
        aria-label="Preview"
        style={{ background: choice.background }}
      >
        <PlayerIconFace icon={choice} />
      </span>
    </div>
  );
}
