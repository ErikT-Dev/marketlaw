import type { GameUpdate } from "./GameUpdate";
import type { RoomView } from "./RoomView";

export type RoomUpdate = {
  readonly room: RoomView;
  readonly game: GameUpdate | null;
};
