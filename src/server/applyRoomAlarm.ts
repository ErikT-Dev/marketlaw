import { randomForNextAction } from "../rules/randomForNextAction";
import type { EpochMs } from "../shared/EpochMs";
import type { PublishingRoom } from "./PublishingRoom";
import type { ReplySocket } from "./ReplySocket";
import type { PlayerRating } from "./records/PlayerRating";
import { saveRecordsIfEnded } from "./records/saveRecordsIfEnded";
import { fireRoomAlarm } from "./room/fireRoomAlarm";
import { playersWhoseUpdateChanged } from "./room/playersWhoseUpdateChanged";
import type { RoomRecord } from "./room/RoomRecord";
import { timeOutNoticesBetween } from "./room/timeOutNoticesBetween";
import { sendChatSince } from "./sendChatSince";

export async function applyRoomAlarm(
  room: PublishingRoom<ReplySocket>,
  db: D1Database,
  { record, now }: { readonly record: RoomRecord; readonly now: EpochMs },
): Promise<ReadonlyArray<PlayerRating>> {
  const { sockets, storage, rooms } = room;
  const { record: fired, removals } = fireRoomAlarm(
    record,
    now,
    randomForNextAction,
    sockets.livePlayers(),
  );
  if (fired === null) {
    sockets.sendRemovals(removals);
    storage.remove();
    return [];
  }
  if (fired === record) {
    return [];
  }
  storage.write(fired);
  await rooms.save();
  sockets.sendRemovals(removals);
  sockets.updatePlayers(
    fired,
    fired.game === null
      ? fired.players.map(({ playerId }) => playerId)
      : playersWhoseUpdateChanged(record, fired),
    null,
  );
  sockets.sendNotices(timeOutNoticesBetween(record, fired));
  sendChatSince(room, { record, messageCount: rooms.chat.messages().length });
  return saveRecordsIfEnded(db, record, fired);
}
