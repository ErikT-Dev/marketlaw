import { useState } from "react";
import { Button } from "../../components/Button";
import { CallVoteDialog } from "./CallVoteDialog";

type Props = {
  readonly onCall: () => void;
  readonly isDisabled: boolean;
};

export function CallVoteButton({ onCall, isDisabled }: Props) {
  const [isAsking, setIsAsking] = useState(false);
  return (
    <>
      <Button
        look="secondary"
        isDisabled={isDisabled}
        onClick={() => {
          setIsAsking(true);
        }}
      >
        Vote to abandon
      </Button>
      {isAsking && !isDisabled ? (
        <CallVoteDialog
          onCancel={() => {
            setIsAsking(false);
          }}
          onCall={() => {
            setIsAsking(false);
            onCall();
          }}
        />
      ) : null}
    </>
  );
}
