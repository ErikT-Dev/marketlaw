import type { RoomCode } from "../shared/RoomCode";
import type { GameRoom } from "./GameRoom";
import { newRoomCode } from "./newRoomCode";

const CODE_ATTEMPTS = 5;

export async function withFreeRoomCode(
  env: Env,
  claim: (room: DurableObjectStub<GameRoom>, code: RoomCode) => Promise<boolean>,
): Promise<RoomCode | null> {
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = newRoomCode();
    if (await claim(env.ROOM.get(env.ROOM.idFromName(code)), code)) {
      return code;
    }
  }
  return null;
}
