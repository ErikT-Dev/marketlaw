import { gameStartInJoinOrder } from "../../simulator/gameStartInJoinOrder.ts";
import { randomUUID } from "node:crypto";
import * as v from "valibot";
import type { GameState } from "../../../src/rules/GameState.ts";
import { SAVE_SCHEMA_VERSION } from "../../../src/rules/SAVE_SCHEMA_VERSION.ts";
import type { Random } from "../../../src/rules/Random.ts";
import type { ConnectionState } from "../../../src/server/room/ConnectionState.ts";
import { receiveCheckingGameStart } from "../../../src/server/room/receiveCheckingGameStart.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { NO_CHAT } from "../../../src/server/room/NO_CHAT.ts";
import { NO_WAITING } from "../../../src/server/room/NO_WAITING.ts";
import { ROOM_SCHEMA_VERSION } from "../../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { AddressedNotice } from "../../../src/server/room/AddressedNotice.ts";
import { otherTabsOf } from "../../../src/server/room/otherTabsOf.ts";
import { fireGameAlarm } from "../../../src/server/room/fireGameAlarm.ts";
import { timeOutNoticesBetween } from "../../../src/server/room/timeOutNoticesBetween.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { parseClientMessage } from "../../../src/shared/protocol/parseClientMessage.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import { rawMessageText } from "./rawMessageText.ts";
import { roomTokenOf } from "./roomTokenOf.ts";
import type { RoomGiven } from "./RoomGiven.ts";
import { NO_CHAT_CONTEXT } from "../../../src/server/room/NO_CHAT_CONTEXT.ts";

type Connection = { state: ConnectionState; isClosed: boolean };

const DEFAULT_ROOM_CODE = "K7QR2P";
const ROOM_SIZE = v.picklist([2, 3, 4]);
const PLAYER_COUNT = v.picklist([1, 2, 3, 4]);

function logLengthOf(record: RoomRecord): number {
  return record.game?.saved.actionLog.length ?? 0;
}

function nameForSeat(given: RoomGiven, seat: number): string {
  return (
    given.seats?.find((entry) => entry.seat === seat)?.player ??
    given.room?.players?.[seat - 1] ??
    `Seat ${String(seat)}`
  );
}

function checkOwnerIsFirst(given: RoomGiven, seatNames: ReadonlyArray<string>): void {
  if (given.room?.owner !== undefined && given.room.owner !== seatNames[0]) {
    throw new Error("the room driver makes the player in seat 1 the owner");
  }
}

export class RoomSession {
  record: RoomRecord;
  now: EpochMs;
  rowsWritten = 0;
  private readonly storage: RoomStorage = {
    read: () => this.record,
    write: (record) => {
      this.record = record;
      this.rowsWritten += 1;
    },
    remove: () => {
      throw new Error("the room driver never removes its room");
    },
  };
  readonly accounts: Map<string, Identity>;
  readonly connections = new Map<string, Connection>();
  readonly offline = new Set<string>();
  readonly openTabs = new Map<string, number>();
  readonly tabMessages: Array<{
    readonly name: string;
    readonly tab: number;
    readonly notice: string;
  }> = [];

  openGame(name: string, tab: number): void {
    const tabs = [...this.openTabs.entries()].map(([owner, open]) => ({
      tab: `${owner}#${String(open)}`,
      playerId: this.identityNamed(owner).playerId,
    }));
    const current = `${name}#${String(tab)}`;
    for (const closed of otherTabsOf(tabs, this.identityNamed(name).playerId, current)) {
      const closedTab = Number(closed.split("#")[1]);
      this.tabMessages.push({ name, tab: closedTab, notice: "game_opened_elsewhere" });
    }
    this.openTabs.set(name, tab);
  }
  readonly seatNames: ReadonlyArray<string>;
  lastReply: ServerMessage | undefined;
  isLastStepUnchanged = false;
  rowsForAccepted: number[] = [];
  rowsForOther: number[] = [];
  handlingMs: number[] = [];
  readonly notices: AddressedNotice[] = [];
  private nextActionNumber = 1;
  private readonly random: Random;

  constructor(state: GameState, given: RoomGiven, random: Random) {
    this.random = random;
    this.now = v.parse(EpochMs, state.pause?.at ?? state.clockStartedAt);
    for (const seat of given.seats ?? []) {
      if (seat.connected === false) {
        this.offline.add(nameForSeat(given, seat.seat));
      }
    }
    this.seatNames = state.seats.map((seat) => nameForSeat(given, seat.seat));
    for (const name of this.seatNames.filter((seatName) => !this.offline.has(seatName))) {
      this.openTabs.set(name, 1);
    }
    const names = [...this.seatNames, ...(given.accounts ?? []).map(({ name }) => name)];
    this.accounts = new Map(
      names.map((name) => [name, { playerId: v.parse(PlayerId, randomUUID()), name }]),
    );
    const players = this.seatNames.map((name) => this.identityNamed(name));
    checkOwnerIsFirst(given, this.seatNames);
    this.record = {
      schemaVersion: ROOM_SCHEMA_VERSION,
      code: v.parse(RoomCode, given.room?.code ?? DEFAULT_ROOM_CODE),
      size: v.parse(ROOM_SIZE, given.room?.size ?? state.seats.length),
      isPublic: given.room?.public ?? false,
      players,
      waiting: NO_WAITING,
      chat: NO_CHAT,
      game: {
        kind: state.kind,
        saved: {
          schemaVersion: SAVE_SCHEMA_VERSION,
          seed: 1,
          setup: {
            players: v.parse(PLAYER_COUNT, state.seats.length),
            kind: state.kind,
            startedAt: state.clockStartedAt,
          },
          startingState: state,
          actionLog: [],
          state,
        },
        seats: state.seats.map((seat, index) => ({
          seat: seat.seat,
          playerId: players[index]?.playerId ?? this.identityNamed("Seat 1").playerId,
          name: players[index]?.name ?? "Seat 1",
          stateVersion: given.seats?.find((entry) => entry.seat === seat.seat)?.state_version ?? 0,
          acceptedActionIds: [],
        })),
      },
    };
  }

  identityNamed(name: string): Identity {
    const known = this.accounts.get(name);
    if (known !== undefined) {
      return known;
    }
    const identity = { playerId: v.parse(PlayerId, randomUUID()), name };
    this.accounts.set(name, identity);
    return identity;
  }

  livePlayers(): ReadonlyArray<PlayerId> {
    return this.seatNames
      .filter((name) => !this.offline.has(name))
      .map((name) => this.identityNamed(name).playerId);
  }

  disconnect(seat: number): void {
    const name = this.seatNames[seat - 1];
    if (name !== undefined) {
      this.offline.add(name);
    }
  }

  async reconnect(seat: number): Promise<void> {
    const name = this.seatNames[seat - 1];
    if (name !== undefined) {
      this.offline.delete(name);
      await this.sendRaw({
        seat,
        text: JSON.stringify({
          protocolVersion: PROTOCOL_VERSION,
          token: roomTokenOf(name),
          type: "resync",
        }),
      });
    }
  }

  wait(ms: number, doesAlarmFire: boolean): void {
    const until = v.parse(EpochMs, this.now + ms);
    for (
      let alarm = nextAlarmAt(this.record);
      doesAlarmFire && alarm !== null && alarm <= until;
      alarm = nextAlarmAt(this.record)
    ) {
      this.now = v.parse(EpochMs, alarm);
      const fired = fireGameAlarm(this.record, this.now, () => this.random, this.livePlayers());
      if (fired !== this.record) {
        this.notices.push(...timeOutNoticesBetween(this.record, fired));
        this.storage.write(fired);
      }
    }
    this.now = until;
  }

  async sendRaw(raw: Readonly<Record<string, unknown>>): Promise<void> {
    const name = this.senderName(raw);
    const connection = this.connections.get(name) ?? {
      state: { identity: null, rejectionTimes: [] },
      isClosed: false,
    };
    if (connection.isClosed) {
      throw new Error(`${name} sent a message on a closed connection`);
    }
    const seatNumber = this.seatNames.indexOf(name) + 1;
    const seat = this.record.game?.seats.find((candidate) => candidate.seat === seatNumber);
    const text = rawMessageText(raw, {
      token: roomTokenOf(name),
      stateVersion: seat?.stateVersion ?? 0,
      actionId: `auto-${this.nextActionNumber++}`,
    });
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk ? this.identityByToken(parsed.value.token) : null;
    const recordBefore = this.record;
    const before = JSON.stringify(this.record);
    const rowsBefore = this.rowsWritten;
    const startedMs = performance.now();
    const handling = receiveCheckingGameStart(
      this.storage,
      {
        connection: connection.state,
        parsed,
        sender,
        now: this.now,
        randomFor: () => this.random,
        gameStart: gameStartInJoinOrder(1, this.now),
        livePlayers: this.livePlayers(),
        chat: NO_CHAT_CONTEXT,
      },
      async () => Promise.resolve(null),
    );
    this.handlingMs.push(performance.now() - startedMs);
    const outcome = await handling;
    this.notices.push(...timeOutNoticesBetween(recordBefore, this.record));
    if (outcome.isRoomGone) {
      throw new Error("the room is gone");
    }
    this.countRows(recordBefore, rowsBefore, outcome.reply);
    this.connections.set(name, { state: outcome.connection, isClosed: outcome.shouldClose });
    this.lastReply = outcome.reply;
    this.isLastStepUnchanged = before === JSON.stringify(this.record);
  }

  private countRows(before: RoomRecord, rowsBefore: number, reply: ServerMessage): void {
    const isAccepted =
      logLengthOf(this.record) > logLengthOf(before) ||
      this.record.players.length !== before.players.length ||
      (reply.type === "update" && reply.acceptedActionId !== null);
    (isAccepted ? this.rowsForAccepted : this.rowsForOther).push(this.rowsWritten - rowsBefore);
  }

  private senderName(raw: Readonly<Record<string, unknown>>): string {
    if (typeof raw["player"] === "string") {
      return this.identityNamed(raw["player"]).name;
    }
    const seat = typeof raw["seat"] === "number" ? raw["seat"] : 1;
    return this.seatNames[seat - 1] ?? this.identityNamed(`Seat ${seat}`).name;
  }

  private identityByToken(token: string): Identity | null {
    return [...this.accounts.values()].find(({ name }) => roomTokenOf(name) === token) ?? null;
  }
}
