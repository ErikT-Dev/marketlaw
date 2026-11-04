import type { GameEnding } from "./GameEnding";
import type { PlaceResult } from "./PlaceResult";

export type GameResult = {
  readonly endedBy: GameEnding;
  readonly places: ReadonlyArray<PlaceResult>;
};
