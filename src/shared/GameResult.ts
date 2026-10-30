import type { PlaceResult } from "./PlaceResult";

export type GameResult = {
  readonly endedBy: "end_goal" | "turn_limit";
  readonly places: ReadonlyArray<PlaceResult>;
};
