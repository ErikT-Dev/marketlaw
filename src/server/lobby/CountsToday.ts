import type { PlayerCountsToday } from "./PlayerCountsToday";

export type CountsToday = {
  readonly day: number;
  readonly players: ReadonlyArray<PlayerCountsToday>;
  readonly siteGameStarts: number;
};
