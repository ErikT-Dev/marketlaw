import { useId } from "react";
import { Button } from "../../components/Button";
import type { TutorialTextBoxContent } from "./TutorialTextBoxContent";
import styles from "./TutorialTextBox.module.css";

type Props = {
  readonly content: TutorialTextBoxContent;
  readonly isConnected: boolean;
  readonly onContinue: () => void;
  readonly onRestart: () => void;
};

export function TutorialTextBox({ content, isConnected, onContinue, onRestart }: Props) {
  const stepId = useId();
  return (
    <section className={styles["box"]} aria-labelledby={stepId}>
      <h2 id={stepId} className={styles["step"]}>
        {content.stepLine}
      </h2>
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph} className={styles["text"]}>
          {paragraph}
        </p>
      ))}
      {content.actionLine === null ? null : (
        <p className={styles["action"]}>{content.actionLine}</p>
      )}
      {content.button === null ? null : (
        <div className={styles["next"]}>
          <Button look="primary" isDisabled={!isConnected} onClick={onContinue}>
            {content.button === "finish" ? "Finish" : "Continue"}
          </Button>
        </div>
      )}
      <div className={styles["restart"]}>
        <Button look="secondary" isDisabled={!isConnected} onClick={onRestart}>
          Restart
        </Button>
      </div>
    </section>
  );
}
