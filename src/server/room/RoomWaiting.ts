import type { RejoinBlock } from "./RejoinBlock";
import type { RoomAsking } from "./RoomAsking";
import type { WaitingDisconnect } from "./WaitingDisconnect";

export type RoomWaiting = {
  readonly asking: RoomAsking | null;
  readonly rejoinBlocks: ReadonlyArray<RejoinBlock>;
  readonly disconnected: ReadonlyArray<WaitingDisconnect>;
};
