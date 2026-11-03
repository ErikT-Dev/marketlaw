import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type GameStart = {
  readonly seed: number;
  readonly now: EpochMs;
  readonly seatOrder: (players: ReadonlyArray<PlayerId>) => ReadonlyArray<PlayerId>;
};
