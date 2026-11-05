import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import type { Result } from "../../shared/Result";
import type { RoomCode } from "../../shared/RoomCode";
import type { ClaimRejection } from "../lobby/ClaimRejection";
import { lobbyOf } from "../lobbyOf";
import { newRoomCode } from "../newRoomCode";
import type { Identity } from "../room/Identity";

const CODE_ATTEMPTS = 5;

export async function createInFreeRoom(
  env: Env,
  owner: Identity,
  room: { readonly size: 2 | 3 | 4; readonly isPublic: boolean },
): Promise<Result<RoomCode, ClaimRejection | "no_free_room_code">> {
  const lobby = lobbyOf(env);
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = newRoomCode();
    const rejection = await lobby.claim(owner.playerId, code, v.parse(EpochMs, Date.now()));
    if (rejection !== null) {
      return { isOk: false, error: rejection };
    }
    const isCreated = await env.ROOM.get(env.ROOM.idFromName(code))
      .createRoom({ code, ...room }, owner)
      .catch(() => false);
    if (isCreated) {
      return { isOk: true, value: code };
    }
    await lobby.release(owner.playerId, code);
  }
  return { isOk: false, error: "no_free_room_code" };
}
