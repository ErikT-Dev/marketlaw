import type { RoomCode } from "../RoomCode";

export type PublicRoomView = {
  readonly code: RoomCode;
  readonly size: number;
  readonly ownerName: string;
  readonly playerNames: ReadonlyArray<string>;
};
