import { useState, type ReactNode } from "react";
import { Button } from "./Button";
import type { LeaveDialogProps } from "./LeaveDialogProps";

type Props = {
  readonly label: string;
  readonly renderDialog: (handlers: LeaveDialogProps) => ReactNode;
  readonly onLeave: () => void;
  readonly isDisabled: boolean;
};

export function AskingLeaveButton({ label, renderDialog, onLeave, isDisabled }: Props) {
  const [isAsking, setIsAsking] = useState(false);
  return (
    <>
      <Button
        look="danger"
        isDisabled={isDisabled}
        onClick={() => {
          setIsAsking(true);
        }}
      >
        {label}
      </Button>
      {isAsking && !isDisabled
        ? renderDialog({
            onStay: () => {
              setIsAsking(false);
            },
            onLeave: () => {
              setIsAsking(false);
              onLeave();
            },
          })
        : null}
    </>
  );
}
