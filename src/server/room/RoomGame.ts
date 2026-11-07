import type { SavedGame } from "../../rules/SavedGame";
import type { SeatPlayer } from "./SeatPlayer";

export type RoomGame = {
  readonly kind: "casual" | "ranked";
  readonly saved: SavedGame;
  readonly seats: ReadonlyArray<SeatPlayer>;
};
