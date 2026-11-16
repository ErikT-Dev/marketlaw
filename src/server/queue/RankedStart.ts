import type { PlayerId } from "../../shared/PlayerId";
import type { RankedGameSize } from "../../shared/RankedGameSize";

export type RankedStart = {
  readonly players: ReadonlyArray<PlayerId>;
  readonly size: RankedGameSize;
};
