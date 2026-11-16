import type { EpochMs } from "../shared/EpochMs";
import type { RoomCode } from "../shared/RoomCode";
import { lobbyOf } from "./lobbyOf";
import type { QueueNoticeTo } from "./queue/QueueNoticeTo";
import type { RankedStart } from "./queue/RankedStart";
import { startedMatchNotices } from "./queue/startedMatchNotices";
import { readUsernames } from "./records/readUsernames";
import { withFreeRoomCode } from "./withFreeRoomCode";

async function rankedRoomCodeOf(env: Env, start: RankedStart): Promise<RoomCode | null> {
  const names = await readUsernames(env.DB, start.players);
  const playersInQueueOrder = start.players.flatMap((playerId) => {
    const name = names.get(playerId);
    return name === undefined ? [] : [{ playerId, name }];
  });
  return withFreeRoomCode(env, async (room, roomCode) =>
    room
      .startRankedRoom({ code: roomCode, size: start.size, playersInQueueOrder })
      .catch(() => false),
  );
}

async function startRankedRoom(
  env: Env,
  start: RankedStart,
  countedAt: EpochMs,
): Promise<ReadonlyArray<QueueNoticeTo>> {
  const code = await rankedRoomCodeOf(env, start).catch(() => null);
  const lobby = lobbyOf(env);
  if (code === null) {
    await lobby.undoRankedStart(start.players, countedAt);
    return start.players.map((playerId) => ({
      playerId,
      notice: { kind: "match_not_started" as const, reason: "no_room" as const },
    }));
  }
  await lobby.moveToRoom(start.players, code);
  return startedMatchNotices(start, code);
}

export async function startRankedRooms(
  env: Env,
  starts: ReadonlyArray<RankedStart>,
  countedAt: EpochMs,
): Promise<ReadonlyArray<QueueNoticeTo>> {
  const notices = await Promise.all(
    starts.map(async (start) => startRankedRoom(env, start, countedAt)),
  );
  return notices.flat();
}
