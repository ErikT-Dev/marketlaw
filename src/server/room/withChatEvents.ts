import type { EpochMs } from "../../shared/EpochMs";
import type { ChatLineEntry } from "../../shared/protocol/ChatLineEntry";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { ChatReader } from "./ChatReader";
import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";

const MAX_CHAT_LINES = 200;

type ChatMoment = { readonly messageCount: number; readonly now: EpochMs };

function isEnded(record: RoomRecord): boolean {
  return record.game?.saved.state.phase === "ended";
}

function hasLeftGame(record: RoomRecord, seat: SeatNumber): boolean {
  return (
    record.game?.saved.state.seats.find((candidate) => candidate.seat === seat)?.hasLeft === true
  );
}

function playersMissingFrom(
  players: ReadonlyArray<Identity>,
  others: ReadonlyArray<Identity>,
): ReadonlyArray<Identity> {
  return players.filter(({ playerId }) => !others.some((other) => other.playerId === playerId));
}

function lineEntriesBetween(
  before: RoomRecord,
  after: RoomRecord,
  at: EpochMs,
): ReadonlyArray<ChatLineEntry> {
  const isNewGame = before.game === null && after.game !== null;
  const seatsThatLeft = isNewGame
    ? []
    : (after.game?.seats ?? []).filter(
        ({ seat }) => hasLeftGame(after, seat) && !hasLeftGame(before, seat),
      );
  const hasEnded = !isNewGame && isEnded(after) && !isEnded(before);
  return [
    ...(isNewGame ? [{ kind: "game_line" as const, event: "game_started" as const, at }] : []),
    ...playersMissingFrom(after.players, before.players).map(({ name }) => ({
      kind: "player_line" as const,
      event: "joined_room" as const,
      name,
      at,
    })),
    ...seatsThatLeft.map(({ name }) => ({
      kind: "player_line" as const,
      event: "left_game" as const,
      name,
      at,
    })),
    ...(hasEnded ? [{ kind: "game_line" as const, event: "game_ended" as const, at }] : []),
    ...playersMissingFrom(before.players, after.players).map(({ name }) => ({
      kind: "player_line" as const,
      event: "left_room" as const,
      name,
      at,
    })),
  ];
}

export function withChatEvents(
  before: RoomRecord | null,
  after: RoomRecord,
  moment: ChatMoment,
): RoomRecord {
  const { chat } = after;
  const entries = before === null ? [] : lineEntriesBetween(before, after, moment.now);
  const readers = after.players.map(
    ({ playerId }): ChatReader =>
      chat.readers.find((reader) => reader.playerId === playerId) ?? {
        playerId,
        messageFrom: moment.messageCount,
        lineFrom: chat.lineCount,
      },
  );
  const isSameReaders =
    readers.length === chat.readers.length &&
    readers.every((reader, index) => reader === chat.readers[index]);
  if (entries.length === 0 && isSameReaders) {
    return after;
  }
  const added = entries.map((entry) => ({ position: moment.messageCount, entry }));
  return {
    ...after,
    chat: {
      readers,
      lines: [...chat.lines, ...added].slice(-MAX_CHAT_LINES),
      lineCount: chat.lineCount + entries.length,
    },
  };
}
