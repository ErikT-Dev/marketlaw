import type { PlayerId } from "../shared/PlayerId";
import type { ConnectionAttachment } from "./ConnectionAttachment";
import type { ReceiveOutcome } from "./room/ReceiveOutcome";
import type { RoomRecord } from "./room/RoomRecord";
import { withAwaySeats } from "./room/withAwaySeats";
import type { Sender } from "./Sender";

const TOO_MANY_REJECTIONS_CLOSE_CODE = 1008;

export function replyToSocket(
  socket: WebSocket,
  sent: {
    readonly attachment: ConnectionAttachment;
    readonly outcome: Extract<ReceiveOutcome, { readonly isRoomGone: false }>;
    readonly sender: Sender | null;
  },
  room: { readonly record: RoomRecord | null; readonly livePlayers: ReadonlyArray<PlayerId> },
): void {
  const { attachment, outcome, sender } = sent;
  socket.serializeAttachment({
    identity: outcome.connection.identity,
    tokenHash:
      outcome.connection.identity === null ? null : (sender?.tokenHash ?? attachment.tokenHash),
    rejectionTimes: outcome.connection.rejectionTimes,
  });
  socket.send(JSON.stringify(withAwaySeats(outcome.reply, room.record, room.livePlayers)));
  if (outcome.shouldClose) {
    socket.close(TOO_MANY_REJECTIONS_CLOSE_CODE, "Too many rejected messages");
  }
}
