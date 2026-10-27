import * as v from "valibot";
import { ROOM_CODE_CHARACTERS } from "../shared/ROOM_CODE_CHARACTERS";
import { RoomCode } from "../shared/RoomCode";

const CODE_LENGTH = 6;
const USABLE_BYTE_LIMIT = 256 - (256 % ROOM_CODE_CHARACTERS.length);

export function newRoomCode(): RoomCode {
  let code = "";
  while (code.length < CODE_LENGTH) {
    const [byte = USABLE_BYTE_LIMIT] = crypto.getRandomValues(new Uint8Array(1));
    if (byte < USABLE_BYTE_LIMIT) {
      code += ROOM_CODE_CHARACTERS.charAt(byte % ROOM_CODE_CHARACTERS.length);
    }
  }
  return v.parse(RoomCode, code);
}
