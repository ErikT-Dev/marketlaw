import type { ScreenRect } from "./ScreenRect";
import styles from "./TutorialMessage.module.css";

type Props = {
  readonly uncovered: ReadonlyArray<ScreenRect>;
};

const OUTLINE_PX = 6;

function holeOf(rect: ScreenRect): string {
  const left = rect.left - OUTLINE_PX;
  const top = rect.top - OUTLINE_PX;
  const width = rect.right - rect.left + 2 * OUTLINE_PX;
  const height = rect.bottom - rect.top + 2 * OUTLINE_PX;
  return `M${String(left)} ${String(top)}h${String(width)}v${String(height)}h${String(-width)}Z`;
}

export function TutorialDimmer({ uncovered }: Props) {
  const outside = "M-10000 -10000H20000V20000H-10000Z";
  const path = [outside, ...uncovered.map(holeOf)].join(" ");
  return (
    <svg className={styles["dimmer"]} data-testid="tutorial-dimmer" aria-hidden="true">
      <path d={path} fillRule="evenodd" />
    </svg>
  );
}
