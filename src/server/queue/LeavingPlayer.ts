import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { QueueNotice } from "../../shared/protocol/QueueNotice";

export type LeavingPlayer = {
  readonly playerId: PlayerId;
  readonly notice: QueueNotice;
  readonly rejoinAt: EpochMs | null;
};
