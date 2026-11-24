import type { ConnectionAttachment } from "./ConnectionAttachment";
import type { PublishingRoom } from "./PublishingRoom";
import type { ReplySocket } from "./ReplySocket";
import { replyToSocket } from "./replyToSocket";
import { loadRoom } from "./room/loadRoom";
import type { ReceiveOutcome } from "./room/ReceiveOutcome";
import { resumeNoticesBetween } from "./room/resumeNoticesBetween";
import type { RoomRecord } from "./room/RoomRecord";
import { timeOutNoticesBetween } from "./room/timeOutNoticesBetween";
import type { Sender } from "./Sender";
import { sendChatSince } from "./sendChatSince";

export async function publishReceived<Socket extends ReplySocket>(
  room: PublishingRoom<Socket>,
  received: {
    readonly socket: Socket;
    readonly attachment: ConnectionAttachment;
    readonly outcome: Extract<ReceiveOutcome, { readonly isRoomGone: false }>;
    readonly sender: Sender | null;
    readonly isResync: boolean;
  },
  before: { readonly record: RoomRecord | null; readonly messageCount: number },
): Promise<RoomRecord | null> {
  const { socket, attachment, outcome, sender } = received;
  const recordAfter = loadRoom(room.storage);
  if (recordAfter === null) {
    return null;
  }
  await room.rooms.save(outcome.chatMessage);
  room.sockets.sendRemovals(outcome.removals);
  replyToSocket(
    socket,
    { attachment, outcome, sender },
    { record: recordAfter, livePlayers: () => room.sockets.livePlayers() },
  );
  const hello =
    received.isResync && sender !== null ? { socket, playerId: sender.identity.playerId } : null;
  if (hello !== null && recordAfter.game !== null) {
    room.sockets.welcome(recordAfter, hello.playerId, socket);
  }
  sendChatSince(room, before, hello);
  room.sockets.updatePlayers(
    recordAfter,
    outcome.playersToUpdate,
    outcome.reply.type === "rejected" ? null : socket,
  );
  room.sockets.sendNotices([
    ...outcome.notices,
    ...timeOutNoticesBetween(before.record, recordAfter),
    ...resumeNoticesBetween(before.record, recordAfter),
  ]);
  return recordAfter;
}
