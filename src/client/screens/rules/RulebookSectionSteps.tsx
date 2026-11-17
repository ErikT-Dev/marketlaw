import { Button } from "../../components/Button";
import { openRulesSection } from "./openRulesSection";
import type { RulebookSectionRef } from "./RulebookSectionRef";
import styles from "./Rules.module.css";

type Props = {
  readonly previous: RulebookSectionRef | null;
  readonly next: RulebookSectionRef | null;
};

export function RulebookSectionSteps({ previous, next }: Props) {
  return (
    <div className={styles["steps"]}>
      {previous === null ? (
        <span />
      ) : (
        <Button
          look="secondary"
          onClick={() => {
            openRulesSection(previous.anchor);
          }}
        >
          <span aria-hidden="true">‹</span>
          <span className={styles["visuallyHidden"]}>Previous:</span> {previous.title}
        </Button>
      )}
      {next === null ? null : (
        <Button
          look="secondary"
          onClick={() => {
            openRulesSection(next.anchor);
          }}
        >
          <span className={styles["visuallyHidden"]}>Next:</span> {next.title}
          <span aria-hidden="true">›</span>
        </Button>
      )}
    </div>
  );
}
