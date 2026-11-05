import type { PlayerId } from "../../shared/PlayerId";

export type PlayerCountsToday = {
  readonly playerId: PlayerId;
  readonly actions: number;
  readonly gameStarts: number;
};
