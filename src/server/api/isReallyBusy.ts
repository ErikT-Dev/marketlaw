import type { PlayerId } from "../../shared/PlayerId";
import type { BusyPlace } from "../lobby/BusyPlace";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { lobbyOf } from "../lobbyOf";
import { queueOf } from "../queueOf";

export async function isReallyBusy(env: Env, playerId: PlayerId, code: BusyPlace | null) {
  const lobby = lobbyOf(env);
  const busyIn = await lobby.busyPlaceOf(playerId);
  if (busyIn === null || busyIn === code) {
    return false;
  }
  const isBusy =
    busyIn === RANKED_QUEUE_PLACE
      ? await queueOf(env).isQueued(playerId)
      : await env.ROOM.get(env.ROOM.idFromName(busyIn)).isPlayerBusy(playerId);
  if (isBusy) {
    return true;
  }
  await lobby.forget(playerId, busyIn);
  return false;
}
