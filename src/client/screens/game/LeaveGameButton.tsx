import { useState } from "react";
import { Button } from "../../components/Button";
import { LeaveGameDialog } from "./LeaveGameDialog";

type Props = {
  readonly onLeave: () => void;
  readonly isDisabled: boolean;
};

export function LeaveGameButton({ onLeave, isDisabled }: Props) {
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
        Leave game
      </Button>
      {isAsking && !isDisabled ? (
        <LeaveGameDialog
          onStay={() => {
            setIsAsking(false);
          }}
          onLeave={() => {
            setIsAsking(false);
            onLeave();
          }}
        />
      ) : null}
    </>
  );
}
