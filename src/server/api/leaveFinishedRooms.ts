import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";
import { lobbyOf } from "../lobbyOf";

export async function leaveFinishedRooms(env: Env, playerId: PlayerId, joined: RoomCode) {
  const codes = await lobbyOf(env).stayingRoomsOf(playerId);
  await Promise.all(
    codes
      .filter((code) => code !== joined)
      .map(async (code) =>
        env.ROOM.get(env.ROOM.idFromName(code))
          .leaveIfFree(playerId)
          .catch(() => undefined),
      ),
  );
}
