import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";
import { lobbyOf } from "../lobbyOf";

export async function isReallyBusy(env: Env, playerId: PlayerId, code: RoomCode | null) {
  const lobby = lobbyOf(env);
  const busyIn = await lobby.busyRoomOf(playerId);
  if (busyIn === null || busyIn === code) {
    return false;
  }
  if (await env.ROOM.get(env.ROOM.idFromName(busyIn)).hasPlayer(playerId)) {
    return true;
  }
  await lobby.forget(playerId, busyIn);
  return false;
}
