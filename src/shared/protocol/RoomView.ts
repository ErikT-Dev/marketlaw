import type { EpochMs } from "../EpochMs";
import type { RoomCode } from "../RoomCode";
import type { SeatNumber } from "../SeatNumber";
import type { AskingView } from "./AskingView";

export type RoomView = {
  readonly code: RoomCode;
  readonly size: number;
  readonly isPublic: boolean;
  readonly ownerName: string;
  readonly playerNames: ReadonlyArray<string>;
  readonly namesInRoom: ReadonlyArray<string>;
  readonly mySeat: SeatNumber | null;
  readonly asking: AskingView | null;
  readonly deletionAt: EpochMs | null;
};
