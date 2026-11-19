import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { Button } from "../../components/Button";

type Props = {
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onAction: (action: ActionIntent) => void;
};

export function RedrawHandButton({ seat, isBusy, onAction }: Props) {
  if (seat.redrawRejection !== null) {
    return null;
  }
  return (
    <Button
      look="menu"
      isDisabled={isBusy}
      onClick={() => {
        onAction({ type: "redraw_hand" });
      }}
    >
      Redraw hand ({seat.redrawsLeft} left)
    </Button>
  );
}
