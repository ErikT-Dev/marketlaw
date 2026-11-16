import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { lobbyOf } from "../lobbyOf";

export async function isReallyBusy(env: Env, playerId: PlayerId, code: RoomCode | null) {
  const lobby = lobbyOf(env);
  const busyIn = await lobby.busyPlaceOf(playerId);
  if (busyIn === null || busyIn === code) {
    return false;
  }
  if (busyIn === RANKED_QUEUE_PLACE) {
    return true;
  }
  if (await env.ROOM.get(env.ROOM.idFromName(busyIn)).isPlayerBusy(playerId)) {
    return true;
  }
  await lobby.forget(playerId, busyIn);
  return false;
}
