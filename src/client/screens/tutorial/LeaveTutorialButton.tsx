import { AskingLeaveButton } from "../../components/AskingLeaveButton";
import { LeaveTutorialDialog } from "./LeaveTutorialDialog";

type Props = {
  readonly onLeave: () => void;
  readonly isDisabled: boolean;
};

export function LeaveTutorialButton({ onLeave, isDisabled }: Props) {
  return (
    <AskingLeaveButton
      label="Leave tutorial"
      renderDialog={(handlers) => <LeaveTutorialDialog {...handlers} />}
      onLeave={onLeave}
      isDisabled={isDisabled}
    />
  );
}
