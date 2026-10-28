import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { ClaimAllDialog } from "./ClaimAllDialog";
import type { OpenDialog } from "./OpenDialog";
import { ProjectsDialog } from "./ProjectsDialog";

type Props = {
  readonly dialog: OpenDialog;
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly onAction: (action: ActionIntent) => void;
  readonly onClose: () => void;
};

export function ProgressDialogs({ dialog, seat, view, playerNames, onAction, onClose }: Props) {
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
    case "projects":
      return (
        <ProjectsDialog
          seat={seat}
          view={view}
          playerNames={playerNames}
          onComplete={(project) => {
            onAction({ type: "complete_project", project });
            onClose();
          }}
          onClose={onClose}
        />
      );
  }
}
