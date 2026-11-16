import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type ClosedConnection = {
  readonly playerId: PlayerId;
  readonly since: EpochMs;
};
