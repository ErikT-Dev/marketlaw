import { lobbyOf } from "./lobbyOf";
import type { QueueNoticeTo } from "./queue/QueueNoticeTo";
import type { RankedStart } from "./queue/RankedStart";
import { startedMatchNotices } from "./queue/startedMatchNotices";
import { readUsernames } from "./records/readUsernames";
import { withFreeRoomCode } from "./withFreeRoomCode";

async function startRankedRoom(
  env: Env,
  start: RankedStart,
): Promise<ReadonlyArray<QueueNoticeTo>> {
  const names = await readUsernames(env.DB, start.players);
  const playersInQueueOrder = start.players.flatMap((playerId) => {
    const name = names.get(playerId);
    return name === undefined ? [] : [{ playerId, name }];
  });
  const code = await withFreeRoomCode(env, async (room, roomCode) =>
    room
      .startRankedRoom({ code: roomCode, size: start.size, playersInQueueOrder })
      .catch(() => false),
  );
  const lobby = lobbyOf(env);
  if (code === null) {
    await lobby.releaseFromQueue(start.players);
    return start.players.map((playerId) => ({
      playerId,
      notice: { kind: "match_not_started" as const },
    }));
  }
  await lobby.moveToRoom(start.players, code);
  return startedMatchNotices(start, code);
}

export async function startRankedRooms(
  env: Env,
  starts: ReadonlyArray<RankedStart>,
): Promise<ReadonlyArray<QueueNoticeTo>> {
  const notices = await Promise.all(starts.map(async (start) => startRankedRoom(env, start)));
  return notices.flat();
}
