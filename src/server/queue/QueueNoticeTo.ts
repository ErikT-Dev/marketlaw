import type { PlayerId } from "../../shared/PlayerId";
import type { QueueNotice } from "../../shared/protocol/QueueNotice";

export type QueueNoticeTo = {
  readonly playerId: PlayerId;
  readonly notice: QueueNotice;
};
