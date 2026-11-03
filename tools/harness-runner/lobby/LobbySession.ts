import { randomUUID } from "node:crypto";
import * as v from "valibot";
import { firstFreeName } from "../../../src/server/accounts/firstFreeName.ts";
import { generatedNames } from "../../../src/server/accounts/generatedNames.ts";
import { guestNameDecision } from "../../../src/server/accounts/guestNameDecision.ts";
import { loginStateOf } from "../../../src/server/accounts/loginStateOf.ts";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { createRoomDecision } from "../../../src/server/room/createRoomDecision.ts";
import { fireRoomAlarm } from "../../../src/server/room/fireRoomAlarm.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { joinRoom } from "../../../src/server/room/joinRoom.ts";
import { NO_WAITING } from "../../../src/server/room/NO_WAITING.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import { receiveMessage } from "../../../src/server/room/receiveMessage.ts";
import { ROOM_SCHEMA_VERSION } from "../../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import { roomSizeOf } from "../../../src/server/room/roomSizeOf.ts";
import { updateFor } from "../../../src/server/room/updateFor.ts";
import { withConnection } from "../../../src/server/room/withConnection.ts";
import { newRoomCode } from "../../../src/server/newRoomCode.ts";
import { randomForNextAction } from "../../../src/rules/randomForNextAction.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { parseClientMessage } from "../../../src/shared/protocol/parseClientMessage.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";

const GENERATED_CANDIDATES = 10;

export class LobbySession {
  record: RoomRecord | null;
  now: EpochMs = v.parse(EpochMs, 0);
  readonly accounts = new Map<string, LobbyAccount>();
  readonly messagesTo = new Map<string, ServerMessage[]>();
  rejected: ReasonCode | null = null;
  generatedName: string | null = null;
  loggedInAs: string | null = null;
  private readonly pendingJoins = new Map<string, string>();
  private readonly random: ScriptedRandom;
  private readonly storage: RoomStorage = {
    read: () => this.record ?? undefined,
    write: (record) => {
      this.record = record;
    },
    remove: () => {
      this.record = null;
    },
  };

  constructor(given: LobbyGiven, random: ScriptedRandom) {
    this.random = random;
    for (const { name, last_used_ms: lastUsedMs } of given.accounts ?? []) {
      this.addAccount(name, lastUsedMs ?? 0);
    }
    this.record =
      given.room === undefined
        ? null
        : lobbyRoomFromGiven(given.room, (name) => this.identityNamed(name), this.now);
  }

  identityNamed(name: string): Identity {
    return (this.accounts.get(name) ?? this.addAccount(name, this.now)).identity;
  }

  snapshot(): string {
    return JSON.stringify([this.record, [...this.accounts.keys()]]);
  }

  wait(ms: number): void {
    const until = this.now + ms;
    for (
      let alarm = nextAlarmAt(this.record);
      this.record !== null && alarm !== null && alarm <= until;
      alarm = nextAlarmAt(this.record)
    ) {
      this.now = v.parse(EpochMs, alarm);
      const fired = fireRoomAlarm(this.record, this.now, randomForNextAction).record;
      if (fired === this.record) {
        break;
      }
      this.record = fired;
    }
    this.now = v.parse(EpochMs, until);
  }

  setConnected(name: string, isConnected: boolean): void {
    if (this.record !== null) {
      const { playerId } = this.identityNamed(name);
      this.record = withConnection(
        this.record,
        playerId,
        isConnected ? { isConnected } : { isConnected, at: this.now },
      );
    }
  }

  createRoom(name: string, step: Readonly<Record<string, unknown>>): void {
    const size = typeof step["size"] === "number" ? step["size"] : 0;
    const roomSize = roomSizeOf(size);
    this.rejected = createRoomDecision(size, step["human_check"] === "passed");
    if (this.rejected === null && roomSize !== null) {
      this.record = {
        schemaVersion: ROOM_SCHEMA_VERSION,
        code: newRoomCode(),
        size: roomSize,
        isPublic: step["public"] === true,
        players: [this.identityNamed(name)],
        waiting: NO_WAITING,
        game: null,
      };
    }
  }

  joinRoom(name: string, code: unknown): void {
    if (this.record === null || this.record.code !== code) {
      this.rejected = "room_not_found";
      return;
    }
    const joined = joinRoom(this.record, this.identityNamed(name), this.now);
    this.rejected = joined.isOk ? null : joined.error.reason;
    if (joined.isOk) {
      this.record = joined.value;
      this.setConnected(name, true);
    }
  }

  visitorJoins(visitor: string, code: unknown): void {
    this.pendingJoins.set(visitor, typeof code === "string" ? code : "");
    this.askGeneratedName();
  }

  askGeneratedName(): void {
    const draw = this.random.next("generated_name", "setup");
    const candidates =
      draw.kind === "listed" && typeof draw.value === "string"
        ? [draw.value]
        : generatedNames((limit) => Math.floor(Math.random() * limit), GENERATED_CANDIDATES);
    this.generatedName = firstFreeName(candidates, this.takenKeys());
  }

  createGuest(visitor: string, step: Readonly<Record<string, unknown>>): void {
    const name = typeof step["username"] === "string" ? step["username"] : "";
    this.rejected = guestNameDecision(name, {
      isTaken: this.takenKeys().includes(nameKeyOf(name)),
      isHuman: step["human_check"] === "passed",
    });
    if (this.rejected !== null) {
      return;
    }
    this.addAccount(name, this.now);
    const code = this.pendingJoins.get(visitor);
    if (code !== undefined) {
      this.joinRoom(name, code);
    }
  }

  openSite(name: string): void {
    const account = this.accounts.get(name);
    const state = account === undefined ? "expired" : loginStateOf(account.lastUsedMs, this.now);
    this.loggedInAs = state === "expired" ? null : name;
    if (account !== undefined && state === "record_use") {
      this.accounts.set(name, { ...account, lastUsedMs: this.now });
    }
  }

  sendRoomAction(name: string, action: Readonly<Record<string, unknown>>): void {
    const sender = this.identityNamed(name);
    const text = JSON.stringify({
      protocolVersion: PROTOCOL_VERSION,
      token: `token-of-${name}`,
      type: "room",
      action,
    });
    const outcome = receiveMessage(this.storage, {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(text),
      sender,
      now: this.now,
      randomFor: randomForNextAction,
      gameStart: { seed: 1, now: this.now, seatOrder: (players) => this.seatOrder(players) },
    });
    this.rejected = outcome.isRoomGone
      ? "room_not_found"
      : outcome.reply.type === "rejected"
        ? outcome.reply.code
        : null;
    if (!outcome.isRoomGone) {
      this.deliver(name, outcome.reply, outcome.playersToUpdate);
    }
  }

  private deliver(
    name: string,
    reply: ServerMessage,
    playersToUpdate: ReadonlyArray<PlayerId>,
  ): void {
    this.messagesTo.set(name, [...(this.messagesTo.get(name) ?? []), reply]);
    const record = this.record;
    if (record === null) {
      return;
    }
    for (const account of this.accounts.values()) {
      if (playersToUpdate.includes(account.identity.playerId)) {
        const sent = this.messagesTo.get(account.identity.name) ?? [];
        this.messagesTo.set(account.identity.name, [
          ...sent,
          {
            type: "update",
            protocolVersion: PROTOCOL_VERSION,
            acceptedActionId: null,
            update: updateFor(record, account.identity.playerId),
            serverNow: this.now,
          },
        ]);
      }
    }
  }

  private seatOrder(players: ReadonlyArray<PlayerId>): ReadonlyArray<PlayerId> {
    const draw = this.random.next("seats", "setup");
    if (draw.kind !== "listed" || !Array.isArray(draw.value)) {
      return players;
    }
    const names: ReadonlyArray<unknown> = draw.value;
    return names.map((name) => this.identityNamed(String(name)).playerId);
  }

  private takenKeys(): ReadonlyArray<string> {
    return [...this.accounts.keys()].map(nameKeyOf);
  }

  private addAccount(name: string, lastUsedMs: number): LobbyAccount {
    const account: LobbyAccount = {
      identity: { playerId: v.parse(PlayerId, randomUUID()), name },
      kind: "guest",
      lastUsedMs,
    };
    this.accounts.set(name, account);
    return account;
  }
}
