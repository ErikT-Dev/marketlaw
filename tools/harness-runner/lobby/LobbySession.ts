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
import { claimPlayer } from "../../../src/server/lobby/claimPlayer.ts";
import { countGameStart } from "../../../src/server/lobby/countGameStart.ts";
import type { GameStartRejection } from "../../../src/server/lobby/GameStartRejection.ts";
import { siteGameLimitOf } from "../../../src/server/lobby/siteGameLimitOf.ts";
import { EMPTY_LOBBY } from "../../../src/server/lobby/EMPTY_LOBBY.ts";
import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { releasePlayer } from "../../../src/server/lobby/releasePlayer.ts";
import { withRoomSummary } from "../../../src/server/lobby/withRoomSummary.ts";
import { roomSummaryOf } from "../../../src/server/room/roomSummaryOf.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import { createRoomIn } from "../../../src/server/room/createRoomIn.ts";
import { joinRoomIn } from "../../../src/server/room/joinRoomIn.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import { receiveMessage } from "../../../src/server/room/receiveMessage.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import { roomSizeOf } from "../../../src/server/room/roomSizeOf.ts";
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
import { endedRoomFromGiven } from "./endedRoomFromGiven.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { otherRoomStorage } from "./otherRoomStorage.ts";
import { countsTodayFromGiven } from "./countsTodayFromGiven.ts";
import { deliverRoomOutcome } from "./deliverRoomOutcome.ts";
import { rejectionOfReply } from "./rejectionOfReply.ts";

const GENERATED_CANDIDATES = 10;
const NAME_STEP = 7;

export class LobbySession {
  record: RoomRecord | null;
  goneAs: "closed" | "deleted" = "closed";
  readonly endedRoom: RoomRecord | null;
  now: EpochMs;
  readonly accounts = new Map<string, LobbyAccount>();
  readonly messagesTo = new Map<string, ServerMessage[]>();
  rejected: ReasonCode | null = null;
  generatedName: string | null = null;
  loggedInAs: string | null = null;
  private readonly pendingJoins = new Map<string, string>();
  private live: ReadonlyArray<PlayerId> = [];
  lobby: LobbyRecord;
  private otherRooms: ReadonlyArray<RoomRecord> = [];
  private namesAsked = 0;
  private readonly random: ScriptedRandom;
  private readonly storage: RoomStorage = {
    read: () => this.record ?? undefined,
    write: (record) => {
      this.record = record;
    },
    remove: () => {
      this.goneAs = this.record?.game === null ? "closed" : "deleted";
      this.record = null;
    },
  };

  constructor(given: LobbyGiven, random: ScriptedRandom) {
    this.random = random;
    this.now = v.parse(EpochMs, given.clock_ms ?? 0);
    for (const { name, last_used_ms: lastUsedMs } of given.accounts ?? []) {
      this.addAccount(name, lastUsedMs ?? 0);
    }
    this.lobby = { ...EMPTY_LOBBY, today: countsTodayFromGiven(given, this.now, this) };
    this.record =
      given.room === undefined || given.room.players.length === 0
        ? null
        : lobbyRoomFromGiven(given.room, (name) => this.identityNamed(name), this.now);
    this.endedRoom = endedRoomFromGiven(given, (name) => this.identityNamed(name), this.now);
    this.otherRooms = (given.other_rooms ?? []).map((room) =>
      lobbyRoomFromGiven(room, (name) => this.identityNamed(name), this.now),
    );
    this.reportRooms();
    this.live = [this.record, ...this.otherRooms].flatMap(
      (room) => room?.players.map(({ playerId }) => playerId) ?? [],
    );
  }

  reportRooms(): void {
    const rooms = [this.record, ...this.otherRooms].flatMap((room) =>
      room === null ? [] : [room],
    );
    const gone = this.lobby.rooms.filter(({ code }) => !rooms.some((room) => room.code === code));
    for (const { code } of gone) {
      this.lobby = withRoomSummary(this.lobby, code, null);
    }
    for (const room of rooms) {
      const summary = roomSummaryOf(room);
      const listed = this.lobby.rooms.find(({ code }) => code === room.code);
      if (JSON.stringify(listed) !== JSON.stringify(summary)) {
        this.lobby = withRoomSummary(this.lobby, room.code, summary);
      }
    }
  }

  livePlayers(): ReadonlyArray<PlayerId> {
    return this.live;
  }

  identityNamed(name: string): Identity {
    return (this.accounts.get(name) ?? this.addAccount(name, this.now)).identity;
  }

  snapshot(): string {
    return JSON.stringify([this.record, this.otherRooms, [...this.accounts.keys()]]);
  }

  wait(ms: number): void {
    const until = this.now + ms;
    for (
      let alarm = nextAlarmAt(this.record);
      this.record !== null && alarm !== null && alarm <= until;
      alarm = nextAlarmAt(this.record)
    ) {
      this.now = v.parse(EpochMs, alarm);
      const fired = fireRoomAlarm(this.record, this.now, randomForNextAction, this.live).record;
      if (fired === this.record) {
        break;
      }
      if (fired === null) {
        this.goneAs = this.record.game === null ? "closed" : "deleted";
      }
      this.record = fired;
    }
    this.now = v.parse(EpochMs, until);
  }

  setConnected(name: string, isConnected: boolean): void {
    const { playerId } = this.identityNamed(name);
    const others = this.live.filter((id) => id !== playerId);
    this.live = isConnected ? [...others, playerId] : others;
    if (!isConnected && this.record !== null) {
      this.record = withConnection(this.record, playerId, { isConnected, at: this.now });
    }
  }

  createRoom(name: string, step: Readonly<Record<string, unknown>>): void {
    const size = typeof step["size"] === "number" ? step["size"] : 0;
    const roomSize = roomSizeOf(size);
    this.rejected = createRoomDecision(size, step["human_check"] === "passed");
    const code = newRoomCode();
    if (
      this.rejected === null &&
      roomSize !== null &&
      this.claimIn(this.identityNamed(name).playerId, code)
    ) {
      const room = { code, size: roomSize, isPublic: step["public"] === true };
      createRoomIn(this.storage, room, this.identityNamed(name), this.now);
      this.setConnected(name, true);
    }
  }

  joinRoom(name: string, code: unknown): void {
    const roomCode = v.safeParse(RoomCode, code);
    const { playerId } = this.identityNamed(name);
    if (roomCode.success && !this.claimIn(playerId, roomCode.output)) {
      return;
    }
    const storage = this.storageFor(code);
    const { rejection } = joinRoomIn(storage, this.identityNamed(name), this.now, this.live);
    this.rejected = rejection?.reason ?? null;
    if (rejection === null) {
      this.setConnected(name, true);
    } else if (roomCode.success) {
      this.lobby = releasePlayer(this.lobby, playerId, roomCode.output);
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
        : generatedNames((limit) => this.nextNameIndex(limit), GENERATED_CANDIDATES);
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
      gameStart: {
        seed: 1,
        now: this.now,
        seatOrder: (players) => this.seatOrder(players),
        limitRejectionFor: (players) => this.countGameStart(players),
      },
      livePlayers: this.live,
    });
    this.rejected = outcome.isRoomGone ? "room_not_found" : rejectionOfReply(outcome.reply);
    if (!outcome.isRoomGone) {
      const delivery = { sender: name, accounts: this.accounts.values(), record: this.record };
      deliverRoomOutcome(this.messagesTo, { ...delivery, now: this.now }, outcome);
    }
  }

  private countGameStart(players: ReadonlyArray<PlayerId>): GameStartRejection | null {
    const limits = { now: this.now, siteGamesPerDay: siteGameLimitOf({}) };
    const counted = countGameStart(this.lobby, players, limits);
    this.lobby = counted.isOk ? counted.value : this.lobby;
    return counted.isOk ? null : counted.error;
  }

  private seatOrder(players: ReadonlyArray<PlayerId>): ReadonlyArray<PlayerId> {
    const draw = this.random.next("seats", "setup");
    if (draw.kind !== "listed" || !Array.isArray(draw.value)) {
      return players;
    }
    const names: ReadonlyArray<unknown> = draw.value;
    return names.map((name) => this.identityNamed(String(name)).playerId);
  }

  private claimIn(playerId: PlayerId, code: RoomCode): boolean {
    const claimed = claimPlayer(this.lobby, playerId, code, this.now);
    this.rejected = claimed.isOk ? null : claimed.error;
    this.lobby = claimed.isOk ? claimed.value : this.lobby;
    return claimed.isOk;
  }

  private storageFor(code: unknown): RoomStorage {
    return this.record?.code === code
      ? this.storage
      : otherRoomStorage(
          () => this.otherRooms,
          (rooms) => {
            this.otherRooms = rooms;
          },
          code,
        );
  }

  private nextNameIndex(limit: number): number {
    this.namesAsked += 1;
    return (this.namesAsked * NAME_STEP) % limit;
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
