import type { PublishingSockets } from "./PublishingSockets";
import type { CompressedRoomStore } from "./room/CompressedRoomStore";
import type { RoomStorage } from "./room/RoomStorage";

export type PublishingRoom<Socket> = {
  readonly rooms: Pick<CompressedRoomStore, "save" | "chat">;
  readonly storage: RoomStorage;
  readonly sockets: PublishingSockets<Socket>;
};
