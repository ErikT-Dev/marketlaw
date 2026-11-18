import { AskingLeaveButton } from "../../components/AskingLeaveButton";
import { LeaveGameDialog } from "./LeaveGameDialog";

type Props = {
  readonly onLeave: () => void;
  readonly isDisabled: boolean;
};

export function LeaveGameButton({ onLeave, isDisabled }: Props) {
  return (
    <AskingLeaveButton
      label="Leave game"
      renderDialog={(handlers) => <LeaveGameDialog {...handlers} />}
      onLeave={onLeave}
      isDisabled={isDisabled}
    />
  );
}
