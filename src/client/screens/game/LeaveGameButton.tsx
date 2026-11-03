import { useState } from "react";
import { Button } from "../../components/Button";
import { LeaveGameDialog } from "./LeaveGameDialog";

type Props = {
  readonly onLeave: () => void;
};

export function LeaveGameButton({ onLeave }: Props) {
  const [isAsking, setIsAsking] = useState(false);
  return (
    <>
      <Button
        look="danger"
        onClick={() => {
          setIsAsking(true);
        }}
      >
        Leave game
      </Button>
      {isAsking ? (
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
