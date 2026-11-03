import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type RoomAsking = {
  readonly deadline: EpochMs;
  readonly accepted: ReadonlyArray<PlayerId>;
};
