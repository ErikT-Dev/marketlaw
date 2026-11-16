import type { PlayerId } from "../../shared/PlayerId";
import type { RankedGameSize } from "../../shared/RankedGameSize";

export type QueueEntry = {
  readonly playerId: PlayerId;
  readonly sizes: ReadonlyArray<RankedGameSize>;
};
