import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { ClaimAllDialog } from "./ClaimAllDialog";
import { InfluenceDialog } from "./InfluenceDialog";
import type { OpenDialog } from "./OpenDialog";
import { ProjectsDialog } from "./ProjectsDialog";

type Props = {
  readonly dialog: OpenDialog;
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onAction: (action: ActionIntent) => void;
  readonly onClose: () => void;
};

export function ProgressDialogs(props: Props) {
  const { dialog, seat, isBusy, onAction, onClose } = props;
  switch (dialog) {
    case "none":
      return null;
    case "claimAll":
      return (
        <ClaimAllDialog
          combos={seat.combos}
          onClaim={() => {
            onAction({ type: "claim_all" });
            onClose();
          }}
          onClose={onClose}
        />
      );
    case "influence":
      return (
        <InfluenceDialog
          seat={seat}
          isBusy={isBusy}
          onTrade={(trade) => {
            onAction({ type: "influence", trade });
          }}
          onDraw={(kind, tier) => {
            onAction({ type: "draw_action", kind, tier });
          }}
          onClose={onClose}
        />
      );
    case "projects":
      return (
        <ProjectsDialog
          seat={seat}
          onComplete={(project) => {
            onAction({ type: "complete_project", project });
            onClose();
          }}
          onClose={onClose}
        />
      );
  }
}
