import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Button } from "../../components/Button";
import type { OpenDialog } from "./OpenDialog";
import { Highlighted } from "./Highlighted";
import { StatChip } from "../../components/StatChip";
import { claimAllCountOf } from "./claimAllCountOf";

type Props = {
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onOpenDialog: (dialog: OpenDialog) => void;
};

export function ProgressButtons({ seat, isBusy, onOpenDialog }: Props) {
  const claims = claimAllCountOf(seat.combos);
  return (
    <>
      <Highlighted part={{ kind: "button", button: "claim_all" }}>
        <Button
          look="primary"
          isDisabled={isBusy || seat.claimAllRejection !== null}
          onClick={() => {
            onOpenDialog("claimAll");
          }}
        >
          Claim all ({claims})
        </Button>
      </Highlighted>
      <Button
        look="primary"
        isDisabled={isBusy}
        onClick={() => {
          onOpenDialog("influence");
        }}
      >
        Use <StatChip stat="influence" />
      </Button>
      <Button
        look="primary"
        isDisabled={isBusy}
        onClick={() => {
          onOpenDialog("projects");
        }}
      >
        Projects
      </Button>
    </>
  );
}
