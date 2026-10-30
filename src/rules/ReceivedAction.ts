import type { Rejection } from "../shared/Rejection";
import type { SavedGame } from "./SavedGame";

export type ReceivedAction = {
  readonly caughtUp: SavedGame;
  readonly saved: SavedGame;
  readonly rejection: Rejection | null;
};
