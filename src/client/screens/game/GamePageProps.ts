import type { ConnectionStatus } from "../../../shared/ConnectionStatus";
import type { Notice } from "../../../shared/Notice";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../../store/PendingAction";
import type { RejectedMove } from "../../store/RejectedMove";

export type GamePageProps = {
  readonly update: RoomUpdate;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly onAction: (action: ActionIntent) => void;
  readonly onDismissRejection: () => void;
  readonly serverClockOffsetMs: number;
  readonly timeOutNotice: Notice | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onExitToLobby: () => void;
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly onPlayHere: () => void;
};
