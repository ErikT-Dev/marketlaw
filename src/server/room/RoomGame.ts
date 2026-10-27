import type { SavedGame } from "../../rules/SavedGame";
import type { SeatPlayer } from "./SeatPlayer";

export type RoomGame = {
  readonly saved: SavedGame;
  readonly seats: ReadonlyArray<SeatPlayer>;
};
