import type { ConnectionStatus } from "../../../shared/ConnectionStatus";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { TutorialView } from "../../../shared/TutorialView";
import type { PendingAction } from "../../store/PendingAction";
import type { RejectedMove } from "../../store/RejectedMove";

export type TutorialPageProps = {
  readonly tutorial: TutorialView;
  readonly playerName: string;
  readonly playerIconColor: number;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly serverClockOffsetMs: number;
  readonly onAction: (action: ActionIntent) => void;
  readonly onContinue: () => void;
  readonly onRestart: () => void;
  readonly onLeave: () => void;
  readonly onDismissRejection: () => void;
  readonly onPlayHere: () => void;
};
