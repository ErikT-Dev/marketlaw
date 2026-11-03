import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type RejoinBlock = {
  readonly playerId: PlayerId;
  readonly until: EpochMs;
};
