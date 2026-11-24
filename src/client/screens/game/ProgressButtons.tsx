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
  const canCompleteAProject = Object.values(seat.projectRejections).some(
    (rejection) => rejection === null,
  );
  return (
    <>
      <Highlighted part={{ kind: "button", button: "claim_all" }}>
        <Button
          look="primary"
          isDisabled={isBusy || seat.claimAllRejection !== null}
          highlightReason={claims > 0 ? "You have combos ready to claim" : null}
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
        Use <StatChip stat="influence" value={seat.stats.influence} />
      </Button>
      <Button
        look="primary"
        isDisabled={isBusy}
        highlightReason={canCompleteAProject ? "You can complete a project now" : null}
        onClick={() => {
          onOpenDialog("projects");
        }}
      >
        Projects
      </Button>
    </>
  );
}
