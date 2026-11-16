import * as v from "valibot";
import { ROOM_CODE_CHARACTERS } from "../../../src/shared/ROOM_CODE_CHARACTERS.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";

const CODE_LENGTH = 6;

export function busyDayRoomCode(game: number): RoomCode {
  const base = ROOM_CODE_CHARACTERS.length;
  const characters = Array.from({ length: CODE_LENGTH }, (unused, place) =>
    ROOM_CODE_CHARACTERS.charAt(Math.floor(game / base ** place) % base),
  );
  return v.parse(RoomCode, characters.join(""));
}
