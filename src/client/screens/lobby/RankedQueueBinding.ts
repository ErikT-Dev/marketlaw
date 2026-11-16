import type { QueueIntent } from "../../../shared/protocol/QueueIntent";
import type { QueueView } from "../../../shared/protocol/QueueView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { LobbyQueueNotice } from "../../store/LobbyQueueNotice";

export type RankedQueueBinding = {
  readonly queue: QueueView | null;
  readonly notice: LobbyQueueNotice | null;
  readonly rejection: ReasonCode | null;
  readonly standingCheck: string;
  readonly onIntent: (intent: QueueIntent) => void;
  readonly onResync: () => void;
  readonly onDismissNotice: () => void;
};
