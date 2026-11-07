import type { PlayerId } from "../shared/PlayerId";
import type { PublishingRoom } from "./PublishingRoom";
import type { ReplySocket } from "./ReplySocket";
import { chatDeliveriesBetween } from "./room/chatDeliveriesBetween";
import { chatListFor } from "./room/chatListFor";
import { loadRoom } from "./room/loadRoom";
import type { RoomRecord } from "./room/RoomRecord";

export function sendChatSince<Socket extends ReplySocket>(
  room: PublishingRoom<Socket>,
  before: { readonly record: RoomRecord | null; readonly messageCount: number },
  hello: { readonly socket: Socket; readonly playerId: PlayerId } | null = null,
): void {
  const record = loadRoom(room.storage);
  const messages = room.rooms.chat.messages();
  const deliveries = chatDeliveriesBetween(before, record, messages);
  for (const { playerId, message } of deliveries) {
    room.sockets.sendTo([playerId], () => message);
  }
  if (hello !== null && record !== null) {
    hello.socket.send(JSON.stringify(chatListFor(record, messages, hello.playerId)));
  }
}
