import type { PlayerId } from "../../shared/PlayerId";
import type { RatingBeforeGame } from "./RatingBeforeGame";

export type PlayerRatingBeforeGame = RatingBeforeGame & {
  readonly playerId: PlayerId;
};
