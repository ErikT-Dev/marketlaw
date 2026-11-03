import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";

export const NO_ROOM: RoomStorage = {
  read: () => undefined,
  write: () => undefined,
  remove: () => undefined,
};
