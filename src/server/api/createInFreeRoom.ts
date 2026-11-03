import type { RoomCode } from "../../shared/RoomCode";
import { lobbyOf } from "../lobbyOf";
import { newRoomCode } from "../newRoomCode";
import type { Identity } from "../room/Identity";

const CODE_ATTEMPTS = 5;

export async function createInFreeRoom(
  env: Env,
  owner: Identity,
  room: { readonly size: 2 | 3 | 4; readonly isPublic: boolean },
): Promise<RoomCode | "busy" | null> {
  const lobby = lobbyOf(env);
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = newRoomCode();
    if (!(await lobby.claim(owner.playerId, code))) {
      return "busy";
    }
    const isCreated = await env.ROOM.get(env.ROOM.idFromName(code))
      .createRoom({ code, ...room }, owner)
      .catch(() => false);
    if (isCreated) {
      return code;
    }
    await lobby.release(owner.playerId, code);
  }
  return null;
}
