import type { GameKind } from "../../shared/GameKind";
import type { SavedGame } from "../../rules/SavedGame";
import type { SeatPlayer } from "./SeatPlayer";

export type RoomGame = {
  readonly kind: GameKind;
  readonly saved: SavedGame;
  readonly seats: ReadonlyArray<SeatPlayer>;
};
