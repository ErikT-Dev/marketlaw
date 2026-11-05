import type { PlayerId } from "../../shared/PlayerId";
import type { GameStartRejection } from "../lobby/GameStartRejection";
import type { GameStart } from "./GameStart";
import type { ReceiveInput } from "./ReceiveInput";
import type { ReceiveOutcome } from "./ReceiveOutcome";
import { receiveMessage } from "./receiveMessage";
import type { RoomStorage } from "./RoomStorage";

type UncheckedInput = Omit<ReceiveInput, "gameStart"> & {
  readonly gameStart: Omit<GameStart, "limitRejectionFor">;
};

type StartChecker = (players: ReadonlyArray<PlayerId>) => Promise<GameStartRejection | null>;

function isAcceptGame(input: UncheckedInput): boolean {
  const { parsed } = input;
  return parsed.isOk && parsed.value.type === "room" && parsed.value.action.type === "accept_game";
}

function startingPlayersOf(
  storage: RoomStorage,
  input: UncheckedInput,
): ReadonlyArray<PlayerId> | null {
  let startingPlayers: ReadonlyArray<PlayerId> | null = null;
  const trialStorage: RoomStorage = { read: storage.read, write: () => null, remove: () => null };
  receiveMessage(trialStorage, {
    ...input,
    gameStart: {
      ...input.gameStart,
      limitRejectionFor: (players) => {
        startingPlayers = players;
        return null;
      },
    },
  });
  return startingPlayers;
}

export async function receiveCheckingGameStart(
  storage: RoomStorage,
  input: UncheckedInput,
  checkGameStart: StartChecker,
): Promise<ReceiveOutcome> {
  const startingPlayers = isAcceptGame(input) ? startingPlayersOf(storage, input) : null;
  const rejection = startingPlayers === null ? null : await checkGameStart(startingPlayers);
  return receiveMessage(storage, {
    ...input,
    gameStart: { ...input.gameStart, limitRejectionFor: () => rejection },
  });
}
