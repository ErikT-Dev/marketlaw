import { gameStartInJoinOrder } from "../gameStartInJoinOrder.ts";
import * as v from "valibot";
import { claimPlayer } from "../../../src/server/lobby/claimPlayer.ts";
import { countGameStart } from "../../../src/server/lobby/countGameStart.ts";
import type { GameStartRejection } from "../../../src/server/lobby/GameStartRejection.ts";
import { siteGameLimitOf } from "../../../src/server/lobby/siteGameLimitOf.ts";
import { withActionsAdded } from "../../../src/server/lobby/withActionsAdded.ts";
import { withRoomSummary } from "../../../src/server/lobby/withRoomSummary.ts";
import { actionsAddedBetween } from "../../../src/server/room/actionsAddedBetween.ts";
import { createRoomIn } from "../../../src/server/room/createRoomIn.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { endedRoomDeletionAt } from "../../../src/server/room/endedRoomDeletionAt.ts";
import { fireRoomAlarm } from "../../../src/server/room/fireRoomAlarm.ts";
import { joinRejectionIn } from "../../../src/server/room/joinRejectionIn.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import { joinRoomIn } from "../../../src/server/room/joinRoomIn.ts";
import { receiveMessage } from "../../../src/server/room/receiveMessage.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { roomSummaryOf } from "../../../src/server/room/roomSummaryOf.ts";
import { withConnection } from "../../../src/server/room/withConnection.ts";
import { randomForNextAction } from "../../../src/rules/randomForNextAction.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { parseClientMessage } from "../../../src/shared/protocol/parseClientMessage.ts";
import { ROOM_CODE_CHARACTERS } from "../../../src/shared/ROOM_CODE_CHARACTERS.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import { BUSY_DAY } from "./BUSY_DAY.ts";
import { BusyDayCounter } from "./BusyDayCounter.ts";
import type { BusyDayCount } from "./BusyDayCount.ts";
import { busyDayChatContext } from "./busyDayChatContext.ts";

const SIZES = [2, 3, 4] as const;
const ARRIVAL_MS = 30_000;
const ACCEPT_MS = 2_000;
const RECONNECT_MS = 3_000;
const CODE_LENGTH = 6;
const TOKEN_AND_LOBBY_READS_PER_ROOM_REQUEST = 4;
const ROOM_READS_PER_JOIN_CHECK = 1;
const TOKEN_READS_PER_PAGE_LOAD = 2;
const TOKEN_AND_LOBBY_READS_BEFORE_JOIN_CHECK = 2;
const LOBBY_READS_PER_CHANGE = 1;

type Day = {
  readonly counter: BusyDayCounter;
  now: number;
  live: PlayerId[];
  reported: RoomRecord | null;
};

function player(game: number, seat: number): Identity {
  const hex = (game * 16 + seat).toString(16).padStart(12, "0");
  return { playerId: v.parse(PlayerId, `00000000-0000-4000-8000-${hex}`), name: `P${hex}` };
}

function codeOf(game: number): RoomCode {
  const base = ROOM_CODE_CHARACTERS.length;
  const characters = Array.from({ length: CODE_LENGTH }, (unused, place) =>
    ROOM_CODE_CHARACTERS.charAt(Math.floor(game / base ** place) % base),
  );
  return v.parse(RoomCode, characters.join(""));
}

function report(day: Day, code: RoomCode): void {
  const { counter } = day;
  const after = counter.record ?? null;
  const summary = after === null ? null : roomSummaryOf(after);
  const played = actionsAddedBetween(day.reported, after);
  const now = v.parse(EpochMs, day.now);
  counter.countReads(LOBBY_READS_PER_CHANGE);
  counter.changeLobby(withActionsAdded(withRoomSummary(counter.lobby, code, summary), played, now));
  day.reported = after;
  if (counter.record?.game === null) {
    counter.syncAlarm();
  }
}

function roomOf(day: Day): RoomRecord | null {
  return day.counter.record ?? null;
}

function advance(day: Day, ms: number, code: RoomCode): void {
  const until = day.now + ms;
  for (
    let alarm = nextAlarmAt(roomOf(day));
    day.counter.record?.game === null && alarm !== null && alarm <= until;
    alarm = nextAlarmAt(roomOf(day))
  ) {
    const record = day.counter.record;
    day.now = alarm;
    const fired = fireRoomAlarm(record, v.parse(EpochMs, alarm), randomForNextAction, day.live);
    if (fired.record === null) {
      day.counter.storage.remove();
    } else if (fired.record !== record) {
      day.counter.storage.write(fired.record);
    }
    report(day, code);
    if (fired.record === record) {
      break;
    }
  }
  day.now = until;
}

function claim(day: Day, joining: Identity, code: RoomCode): void {
  day.counter.countReads(TOKEN_AND_LOBBY_READS_PER_ROOM_REQUEST + TOKEN_READS_PER_PAGE_LOAD);
  const claimed = claimPlayer(day.counter.lobby, joining.playerId, code, v.parse(EpochMs, day.now));
  if (claimed.isOk) {
    day.counter.changeLobby(claimed.value);
  }
}

function join(day: Day, joining: Identity, code: RoomCode): void {
  advance(day, ARRIVAL_MS, code);
  day.counter.countReads(ROOM_READS_PER_JOIN_CHECK);
  claim(day, joining, code);
  joinRoomIn(day.counter.storage, joining, v.parse(EpochMs, day.now), day.live);
  day.live = [...day.live, joining.playerId];
  report(day, code);
}

function countStart(day: Day, players: ReadonlyArray<PlayerId>): GameStartRejection | null {
  const limits = { now: v.parse(EpochMs, day.now), siteGamesPerDay: siteGameLimitOf({}) };
  day.counter.countReads(LOBBY_READS_PER_CHANGE);
  const counted = countGameStart(day.counter.lobby, players, limits);
  if (counted.isOk) {
    day.counter.changeLobby(counted.value);
  }
  return counted.isOk ? null : counted.error;
}

function send(
  day: Day,
  sender: Identity,
  message: Readonly<Record<string, unknown> & { type: "room" | "action" }>,
  code: RoomCode,
): void {
  advance(day, ACCEPT_MS, code);
  const now = v.parse(EpochMs, day.now);
  const storage = message.type === "room" ? day.counter.storage : day.counter.gameStorage;
  const outcome = receiveMessage(storage, {
    connection: { identity: sender, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...message }),
    ),
    sender,
    now,
    randomFor: randomForNextAction,
    gameStart: {
      ...gameStartInJoinOrder(1, now),
      limitRejectionFor: (players) => countStart(day, players),
    },
    livePlayers: day.live,
    chat: busyDayChatContext(day.counter, now),
  });
  if (!outcome.isRoomGone && outcome.chatMessage !== null) {
    day.counter.chatBlocks.storage.append(outcome.chatMessage);
    day.counter.chatBlocks.save();
  }
  report(day, code);
}

function roomAction(day: Day, sender: Identity, action: object, code: RoomCode): void {
  send(day, sender, { type: "room", action }, code);
}

function leaveGame(day: Day, leaving: Identity, code: RoomCode): void {
  const seat = day.counter.record?.game?.seats.find(
    ({ playerId }) => playerId === leaving.playerId,
  );
  const action = { type: "leave_game" };
  const stateVersion = seat?.stateVersion ?? 0;
  send(day, leaving, { type: "action", actionId: "leave", stateVersion, action }, code);
}

function endGame(day: Day, code: RoomCode): void {
  const record = day.counter.record;
  const game = record?.game;
  if (record !== undefined && game !== null && game !== undefined) {
    const state = { ...game.saved.state, phase: "ended" as const };
    day.counter.gameStorage.write({
      ...record,
      game: { ...game, saved: { ...game.saved, state } },
    });
    report(day, code);
  }
}

function closeEndedRoom(day: Day, code: RoomCode): void {
  const record = day.counter.record;
  const deletionAt = record === undefined ? null : endedRoomDeletionAt(record);
  if (record === undefined || deletionAt === null) {
    return;
  }
  day.counter.count(
    "database",
    BUSY_DAY.rowsPerReplayRecordWritten + BUSY_DAY.rowsPerReplayRecordDeleted,
  );
  day.counter.countReads(BUSY_DAY.rowsReadPerReplayRecordDeleted + BUSY_DAY.rowsReadPerRoomCleanup);
  const fired = fireRoomAlarm(record, v.parse(EpochMs, deletionAt), randomForNextAction, []);
  if (fired.record === null) {
    day.counter.storage.remove();
  }
  report(day, code);
}

function refreshPage(day: Day, refreshing: Identity, code: RoomCode): void {
  const record = day.counter.record;
  if (record !== undefined) {
    const at = v.parse(EpochMs, day.now);
    day.live = day.live.filter((id) => id !== refreshing.playerId);
    day.counter.storage.write(
      withConnection(record, refreshing.playerId, { isConnected: false, at }),
    );
    report(day, code);
    advance(day, RECONNECT_MS, code);
    day.counter.countReads(TOKEN_READS_PER_PAGE_LOAD);
    day.live = [...day.live, refreshing.playerId];
    advance(day, ARRIVAL_MS, code);
  }
}

function playRoom(day: Day, game: number): void {
  const size = SIZES[game % SIZES.length] ?? 3;
  const code = codeOf(game);
  const players = Array.from({ length: size }, (unused, seat) => player(game, seat));
  const [owner, ...joiners] = players;
  if (owner === undefined) {
    return;
  }
  day.counter.newRoom();
  day.reported = null;
  day.live = [owner.playerId];
  claim(day, owner, code);
  createRoomIn(
    day.counter.storage,
    { code, size, isPublic: true },
    owner,
    v.parse(EpochMs, day.now),
  );
  report(day, code);
  const leaver = player(game, size);
  join(day, leaver, code);
  roomAction(day, leaver, { type: "leave_room" }, code);
  refreshPage(day, owner, code);
  joiners.forEach((joining) => {
    join(day, joining, code);
  });
  players.forEach((accepting) => {
    roomAction(day, accepting, { type: "accept_game" }, code);
  });
  day.counter.countReads(TOKEN_AND_LOBBY_READS_BEFORE_JOIN_CHECK);
  joinRejectionIn(day.counter.storage, player(game, size + 1), v.parse(EpochMs, day.now), day.live);
  const lastJoiner = joiners.at(-1);
  if (lastJoiner !== undefined) {
    leaveGame(day, lastJoiner, code);
  }
  endGame(day, code);
  for (let message = 0; message < BUSY_DAY.chatMessages / BUSY_DAY.games; message += 1) {
    const sender = players[message % players.length] ?? owner;
    roomAction(day, sender, { type: "send_chat", text: `message ${String(message)}` }, code);
  }
  closeEndedRoom(day, code);
}

export function simulateBusyDay(): BusyDayCount {
  const day: Day = { counter: new BusyDayCounter(), now: 1_000_000, live: [], reported: null };
  for (let game = 0; game < BUSY_DAY.games; game += 1) {
    playRoom(day, game);
  }
  day.counter.count(
    "database",
    BUSY_DAY.newGuests * BUSY_DAY.rowsPerNewGuest +
      BUSY_DAY.returningPlayers * BUSY_DAY.rowsPerReturningPlayer,
  );
  return day.counter.total();
}
