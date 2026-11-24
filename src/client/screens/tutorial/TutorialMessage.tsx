import { useRef } from "react";
import { TutorialArrow } from "./TutorialArrow";
import { TutorialDimmer } from "./TutorialDimmer";
import { TutorialTextBox } from "./TutorialTextBox";
import type { TutorialTextBoxContent } from "./TutorialTextBoxContent";
import { useTutorialMessageLayout } from "./useTutorialMessageLayout";

type Props = {
  readonly content: TutorialTextBoxContent;
  readonly isConnected: boolean;
  readonly onContinue: () => void;
  readonly onRestart: () => void;
};

export function TutorialMessage({ content, ...props }: Props) {
  const boxRef = useRef<HTMLElement>(null);
  const layout = useTutorialMessageLayout(boxRef, content.stepLine);
  const placement = layout?.placement ?? null;
  const isWaitingForContinue = content.button !== null;
  return (
    <>
      {isWaitingForContinue ? <TutorialDimmer uncovered={layout?.highlighted ?? []} /> : null}
      <TutorialTextBox
        {...props}
        content={content}
        boxRef={boxRef}
        position={
          placement === null
            ? null
            : { left: placement.boxLeft, top: placement.boxTop, width: placement.boxWidth }
        }
      />
      {placement === null ? null : <TutorialArrow placement={placement} />}
    </>
  );
}
