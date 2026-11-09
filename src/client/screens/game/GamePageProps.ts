import type { ConnectionStatus } from "../../../shared/ConnectionStatus";
import type { Notice } from "../../../shared/Notice";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../../store/PendingAction";
import type { RejectedMove } from "../../store/RejectedMove";
import type { AccountBinding } from "../account/AccountBinding";
import type { ChatBinding } from "../chat/ChatBinding";

export type GamePageProps = {
  readonly update: RoomUpdate;
  readonly chat: ChatBinding;
  readonly account: AccountBinding;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly onAction: (action: ActionIntent) => void;
  readonly onDismissRejection: () => void;
  readonly serverClockOffsetMs: number;
  readonly timeOutNotice: Notice | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onExitToLobby: () => void;
  readonly onCloseResult: () => void;
  readonly onAskRematch: (() => void) | null;
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly onPlayHere: () => void;
};
