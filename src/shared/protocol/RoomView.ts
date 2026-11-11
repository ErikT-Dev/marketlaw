import type { EpochMs } from "../EpochMs";
import type { PlayerId } from "../PlayerId";
import type { RoomCode } from "../RoomCode";
import type { SeatNumber } from "../SeatNumber";
import type { AskingView } from "./AskingView";

export type RoomView = {
  readonly code: RoomCode;
  readonly size: number;
  readonly isPublic: boolean;
  readonly ownerName: string;
  readonly playerNames: ReadonlyArray<string>;
  readonly playerIds: ReadonlyArray<PlayerId>;
  readonly namesInRoom: ReadonlyArray<string>;
  readonly idsInRoom: ReadonlyArray<PlayerId>;
  readonly myName: string;
  readonly mySeat: SeatNumber | null;
  readonly asking: AskingView | null;
  readonly deletionAt: EpochMs | null;
};
