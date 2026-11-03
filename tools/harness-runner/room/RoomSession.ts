import { randomUUID } from "node:crypto";
import * as v from "valibot";
import type { GameState } from "../../../src/rules/GameState.ts";
import { SAVE_SCHEMA_VERSION } from "../../../src/rules/SAVE_SCHEMA_VERSION.ts";
import type { Random } from "../../../src/rules/Random.ts";
import type { ConnectionState } from "../../../src/server/room/ConnectionState.ts";
import { receiveMessage } from "../../../src/server/room/receiveMessage.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { NO_WAITING } from "../../../src/server/room/NO_WAITING.ts";
import { ROOM_SCHEMA_VERSION } from "../../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { AddressedNotice } from "../../../src/server/room/AddressedNotice.ts";
import { fireAlarm } from "../../../src/server/room/fireAlarm.ts";
import { timeOutNoticesBetween } from "../../../src/server/room/timeOutNoticesBetween.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { parseClientMessage } from "../../../src/shared/protocol/parseClientMessage.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import { rawMessageText } from "./rawMessageText.ts";
import type { RoomGiven } from "./RoomGiven.ts";

type Connection = { state: ConnectionState; isClosed: boolean };

const DEFAULT_ROOM_CODE = "K7QR2P";
const ROOM_SIZE = v.picklist([2, 3, 4]);
const PLAYER_COUNT = v.picklist([1, 2, 3, 4]);

function tokenOf(name: string): string {
  return `token-of-${name.replace(/\W/g, "-")}`;
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
    this.now = v.parse(EpochMs, state.clockStartedAt);
    this.seatNames = state.seats.map(
      (seat) => given.room?.players?.[seat.seat - 1] ?? `Seat ${seat.seat}`,
    );
    const names = [...this.seatNames, ...(given.accounts ?? []).map(({ name }) => name)];
    this.accounts = new Map(
      names.map((name) => [name, { playerId: v.parse(PlayerId, randomUUID()), name }]),
    );
    const players = this.seatNames.map((name) => this.identityNamed(name));
    this.record = {
      schemaVersion: ROOM_SCHEMA_VERSION,
      code: v.parse(RoomCode, given.room?.code ?? DEFAULT_ROOM_CODE),
      size: v.parse(ROOM_SIZE, given.room?.size ?? state.seats.length),
      isPublic: given.room?.public ?? false,
      players,
      waiting: NO_WAITING,
      game: {
        kind: "casual",
        saved: {
          schemaVersion: SAVE_SCHEMA_VERSION,
          seed: 1,
          setup: {
            players: v.parse(PLAYER_COUNT, state.seats.length),
            startedAt: state.clockStartedAt,
          },
          startingState: state,
          actionLog: [],
          state,
        },
        seats: state.seats.map((seat, index) => ({
          seat: seat.seat,
          playerId: players[index]?.playerId ?? this.identityNamed("Seat 1").playerId,
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

  wait(ms: number, doesAlarmFire: boolean): void {
    const until = v.parse(EpochMs, this.now + ms);
    for (
      let alarm = nextAlarmAt(this.record);
      doesAlarmFire && alarm !== null && alarm <= until;
      alarm = nextAlarmAt(this.record)
    ) {
      this.now = v.parse(EpochMs, alarm);
      const fired = fireAlarm(this.record, this.now, () => this.random);
      if (fired !== this.record) {
        this.notices.push(...timeOutNoticesBetween(this.record, fired));
        this.storage.write(fired);
      }
    }
    this.now = until;
  }

  sendRaw(raw: Readonly<Record<string, unknown>>): void {
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
      token: tokenOf(name),
      stateVersion: seat?.stateVersion ?? 0,
      actionId: `auto-${this.nextActionNumber++}`,
    });
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk ? this.identityByToken(parsed.value.token) : null;
    const recordBefore = this.record;
    const before = JSON.stringify(this.record);
    const rowsBefore = this.rowsWritten;
    const startedMs = performance.now();
    const outcome = receiveMessage(this.storage, {
      connection: connection.state,
      parsed,
      sender,
      now: this.now,
      randomFor: () => this.random,
      gameStart: { seed: 1, now: this.now, seatOrder: (players) => players },
    });
    this.handlingMs.push(performance.now() - startedMs);
    this.notices.push(...timeOutNoticesBetween(recordBefore, this.record));
    if (outcome.isRoomGone) {
      throw new Error("the room is gone");
    }
    const isAccepted = outcome.reply.type === "update" && outcome.reply.acceptedActionId !== null;
    (isAccepted ? this.rowsForAccepted : this.rowsForOther).push(this.rowsWritten - rowsBefore);
    this.connections.set(name, { state: outcome.connection, isClosed: outcome.shouldClose });
    this.lastReply = outcome.reply;
    this.isLastStepUnchanged = before === JSON.stringify(this.record);
  }

  private senderName(raw: Readonly<Record<string, unknown>>): string {
    if (typeof raw["player"] === "string") {
      return this.identityNamed(raw["player"]).name;
    }
    const seat = typeof raw["seat"] === "number" ? raw["seat"] : 1;
    return this.seatNames[seat - 1] ?? this.identityNamed(`Seat ${seat}`).name;
  }

  private identityByToken(token: string): Identity | null {
    return [...this.accounts.values()].find(({ name }) => tokenOf(name) === token) ?? null;
  }
}
