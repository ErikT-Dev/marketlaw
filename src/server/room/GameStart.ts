import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { GameStartRejection } from "../lobby/GameStartRejection";

export type GameStart = {
  readonly seed: number;
  readonly now: EpochMs;
  readonly seatOrder: (players: ReadonlyArray<PlayerId>) => ReadonlyArray<PlayerId>;
  readonly limitRejectionFor: (players: ReadonlyArray<PlayerId>) => GameStartRejection | null;
};
