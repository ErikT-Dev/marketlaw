import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Button } from "../../components/Button";
import type { OpenDialog } from "./OpenDialog";
import { Highlighted } from "./Highlighted";
import { StatChip } from "../../components/StatChip";

type Props = {
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onOpenDialog: (dialog: OpenDialog) => void;
};

export function ProgressButtons({ seat, isBusy, onOpenDialog }: Props) {
  const ready = seat.combos.filter(({ readyTimes }) => readyTimes > 0).length;
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
          Claim all ({ready})
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
