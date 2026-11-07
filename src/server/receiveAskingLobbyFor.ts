import { randomForNextAction } from "../rules/randomForNextAction";
import type { PlayerId } from "../shared/PlayerId";
import type { parseClientMessage } from "../shared/protocol/parseClientMessage";
import type { ConnectionAttachment } from "./ConnectionAttachment";
import { lobbyOf } from "./lobbyOf";
import { newGameStart } from "./newGameStart";
import { nowMs } from "./nowMs";
import type { ChatStorage } from "./room/ChatStorage";
import { receiveAskingLobby } from "./room/receiveAskingLobby";
import type { ReceiveOutcome } from "./room/ReceiveOutcome";
import type { RoomStorage } from "./room/RoomStorage";
import type { Sender } from "./Sender";

export async function receiveAskingLobbyFor(
  room: {
    readonly env: Env;
    readonly storage: RoomStorage;
    readonly chat: ChatStorage;
    readonly livePlayers: ReadonlyArray<PlayerId>;
  },
  attachment: ConnectionAttachment,
  message: {
    readonly parsed: ReturnType<typeof parseClientMessage>;
    readonly sender: Sender | null;
  },
): Promise<ReceiveOutcome> {
  const now = nowMs();
  const input = {
    connection: { identity: attachment.identity, rejectionTimes: attachment.rejectionTimes },
    parsed: message.parsed,
    sender: message.sender?.identity ?? null,
    now,
    randomFor: randomForNextAction,
    gameStart: newGameStart(now),
    livePlayers: room.livePlayers,
    chat: { messages: room.chat.messages(), quota: room.chat.quota() },
  };
  return receiveAskingLobby(room.storage, input, {
    startGame: async (players) => lobbyOf(room.env).startGame(players, now),
    grantChatQuota: async () => lobbyOf(room.env).grantChatQuota(now),
  });
}
