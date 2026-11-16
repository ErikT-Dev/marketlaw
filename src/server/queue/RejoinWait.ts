import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type RejoinWait = {
  readonly playerId: PlayerId;
  readonly until: EpochMs;
};
