import type { TutorialMessagePlacement } from "./TutorialMessagePlacement";
import styles from "./TutorialMessage.module.css";

type Props = {
  readonly placement: TutorialMessagePlacement;
};

export function TutorialArrow({ placement }: Props) {
  const width = placement.arrowRight - placement.arrowLeft;
  if (width <= 0) {
    return null;
  }
  return (
    <div
      className={styles["arrow"]}
      data-testid="tutorial-arrow"
      style={{ left: placement.arrowLeft, top: placement.arrowY, width }}
    />
  );
}
