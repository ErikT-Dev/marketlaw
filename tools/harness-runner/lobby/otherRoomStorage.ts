import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import { NO_ROOM } from "./NO_ROOM.ts";

export function otherRoomStorage(
  rooms: () => ReadonlyArray<RoomRecord>,
  replaceRooms: (rooms: ReadonlyArray<RoomRecord>) => void,
  code: unknown,
): RoomStorage {
  const index = rooms().findIndex((room) => room.code === code);
  return index < 0
    ? NO_ROOM
    : {
        read: () => rooms()[index],
        write: (record) => {
          replaceRooms(rooms().map((room, at) => (at === index ? record : room)));
        },
        remove: () => {
          replaceRooms(rooms().filter((unusedRoom, at) => at !== index));
        },
      };
}
