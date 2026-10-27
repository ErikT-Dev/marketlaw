import type { RoomCode } from "../RoomCode";
import type { SeatNumber } from "../SeatNumber";

export type RoomView = {
  readonly code: RoomCode;
  readonly size: number;
  readonly playerNames: ReadonlyArray<string>;
  readonly mySeat: SeatNumber | null;
};
