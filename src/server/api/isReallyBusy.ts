import type { PlayerId } from "../../shared/PlayerId";
import type { BusyPlace } from "../lobby/BusyPlace";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { TUTORIAL_PLACE } from "../lobby/TUTORIAL_PLACE";
import { lobbyOf } from "../lobbyOf";
import { queueOf } from "../queueOf";
import { tutorialOf } from "../tutorialOf";

async function isBusyIn(env: Env, playerId: PlayerId, place: BusyPlace): Promise<boolean> {
  switch (place) {
    case RANKED_QUEUE_PLACE:
      return queueOf(env).isQueued(playerId);
    case TUTORIAL_PLACE:
      return tutorialOf(env, playerId).isPlayerBusy();
    default:
      return env.ROOM.get(env.ROOM.idFromName(place)).isPlayerBusy(playerId);
  }
}

export async function isReallyBusy(env: Env, playerId: PlayerId, code: BusyPlace | null) {
  const lobby = lobbyOf(env);
  const busyIn = await lobby.busyPlaceOf(playerId);
  if (busyIn === null || busyIn === code) {
    return false;
  }
  if (await isBusyIn(env, playerId, busyIn)) {
    return true;
  }
  await lobby.forget(playerId, busyIn);
  return false;
}
