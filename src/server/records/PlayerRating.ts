import type { PlayerId } from "../../shared/PlayerId";

export type PlayerRating = {
  readonly playerId: PlayerId;
  readonly rating: number;
};
