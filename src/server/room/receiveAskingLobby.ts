import type { PlayerId } from "../../shared/PlayerId";
import type { GameStartRejection } from "../lobby/GameStartRejection";
import type { ChatContext } from "./ChatContext";
import type { ChatQuotaGrant } from "./ChatQuotaGrant";
import type { GameStart } from "./GameStart";
import type { ReceiveInput } from "./ReceiveInput";
import type { ReceiveOutcome } from "./ReceiveOutcome";
import { receiveCheckingGameStart } from "./receiveCheckingGameStart";
import { receiveMessage } from "./receiveMessage";
import type { RoomStorage } from "./RoomStorage";

type AskingInput = Omit<ReceiveInput, "gameStart" | "chat"> & {
  readonly gameStart: Omit<GameStart, "limitRejectionFor">;
  readonly chat: Omit<ChatContext, "grantQuota">;
};

type LobbyQuestions = {
  readonly startGame: (players: ReadonlyArray<PlayerId>) => Promise<GameStartRejection | null>;
  readonly grantChatQuota: () => Promise<number>;
};

const NOT_ASKED: ChatQuotaGrant = { kind: "granted", count: 0 };

function isSendChat(input: AskingInput): boolean {
  const { parsed } = input;
  return parsed.isOk && parsed.value.type === "room" && parsed.value.action.type === "send_chat";
}

function needsChatQuota(storage: RoomStorage, input: AskingInput): boolean {
  let isAsked = false;
  const trialStorage: RoomStorage = { read: storage.read, write: () => null, remove: () => null };
  receiveMessage(trialStorage, {
    ...input,
    gameStart: { ...input.gameStart, limitRejectionFor: () => null },
    chat: {
      ...input.chat,
      grantQuota: () => {
        isAsked = true;
        return { kind: "granted", count: 1 };
      },
    },
  });
  return isAsked;
}

async function grantFrom(lobby: LobbyQuestions): Promise<ChatQuotaGrant> {
  try {
    return { kind: "granted", count: await lobby.grantChatQuota() };
  } catch {
    return { kind: "no_answer" };
  }
}

export async function receiveAskingLobby(
  storage: RoomStorage,
  input: AskingInput,
  lobby: LobbyQuestions,
): Promise<ReceiveOutcome> {
  const grant =
    isSendChat(input) && needsChatQuota(storage, input) ? await grantFrom(lobby) : NOT_ASKED;
  return receiveCheckingGameStart(
    storage,
    { ...input, chat: { ...input.chat, grantQuota: () => grant } },
    lobby.startGame,
  );
}
