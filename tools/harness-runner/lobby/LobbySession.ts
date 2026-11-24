import { randomUUID } from "node:crypto";
import { accountChangesFromGiven } from "./accountChangesFromGiven.ts";
import { newLobbyAccount } from "./newLobbyAccount.ts";
import { NO_ACCOUNT_CHANGES } from "./NO_ACCOUNT_CHANGES.ts";
import { scriptedGuestChanges } from "./scriptedGuestChanges.ts";
import * as v from "valibot";
import { guestNameDecision } from "../../../src/server/accounts/guestNameDecision.ts";
import { loginStateOf } from "../../../src/server/accounts/loginStateOf.ts";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { createRoomDecision } from "../../../src/server/room/createRoomDecision.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { claimPlayer } from "../../../src/server/lobby/claimPlayer.ts";
import { EMPTY_LOBBY } from "../../../src/server/lobby/EMPTY_LOBBY.ts";
import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { releasePlayer } from "../../../src/server/lobby/releasePlayer.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import { createRoomIn } from "../../../src/server/room/createRoomIn.ts";
import { joinRoomIn } from "../../../src/server/room/joinRoomIn.ts";
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
import { EndedRoomRecords } from "./EndedRoomRecords.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { otherRoomStorage } from "./otherRoomStorage.ts";
import { countsTodayFromGiven } from "./countsTodayFromGiven.ts";
import { deliverRoomOutcome } from "./deliverRoomOutcome.ts";
import { rejectionOfReply } from "./rejectionOfReply.ts";
import { LobbyChat } from "./LobbyChat.ts";
import { seatOrderDrawn } from "./seatOrderDrawn.ts";
import { chatFromGiven } from "./chatFromGiven.ts";
import { lobbyWithRooms } from "./lobbyWithRooms.ts";
import { chatTrackingStorage } from "../../../src/server/room/chatTrackingStorage.ts";
import { leaveRoomIfFreeIn } from "../../../src/server/room/leaveRoomIfFreeIn.ts";
import { fireAlarmsUntil } from "./fireAlarmsUntil.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { FailedLogins } from "../../../src/server/accounts/FailedLogins.ts";
import { registrationFromGiven } from "./registrationFromGiven.ts";
import { scriptedGeneratedName } from "./scriptedGeneratedName.ts";
import { LobbyEmails } from "./LobbyEmails.ts";
import { LobbyHistory } from "./LobbyHistory.ts";
import { queueStateFromGiven } from "./queueStateFromGiven.ts";
import type { QueueRecord } from "../../../src/server/queue/QueueRecord.ts";
import type { QueueNotice } from "../../../src/shared/protocol/QueueNotice.ts";
import { countGameStartInLobby } from "./countGameStartInLobby.ts";
import { grantChatQuotaInLobby } from "./grantChatQuotaInLobby.ts";
import { givenRoomRecordOf } from "./givenRoomRecordOf.ts";
import { actionsAddedBetween } from "../../../src/server/room/actionsAddedBetween.ts";
import { withActionsAdded } from "../../../src/server/lobby/withActionsAdded.ts";
import { lobbyTutorialSession } from "./lobbyTutorialSession.ts";

export class LobbySession {
  record: RoomRecord | null;
  goneAs: "closed" | "deleted" = "closed";
  readonly endedRoom: EndedRoomRecords;
  now: EpochMs;
  readonly accounts = new Map<string, LobbyAccount>();
  readonly messagesTo = new Map<string, ServerMessage[]>();
  rejected: ReasonCode | null = null;
  generatedName: string | null = null;
  loggedIn: Readonly<Record<string, string>> | null = null;
  readonly visitorLogins = new Map<string, string>();
  readonly unknownLoginFailures = new Map<string, FailedLogins>();
  private readonly afterGuest = new Map<string, (name: string) => void>();
  private live: ReadonlyArray<PlayerId> = [];
  lobby: LobbyRecord;
  queue: QueueRecord;
  readonly queueNoticesTo = new Map<string, QueueNotice[]>();
  private otherRooms: ReadonlyArray<RoomRecord> = [];
  private namesAsked = 0;
  readonly random: ScriptedRandom;
  readonly chat: LobbyChat;
  readonly emails: LobbyEmails;
  readonly history: LobbyHistory;
  readonly tutorial = lobbyTutorialSession(this);
  readonly storage: RoomStorage = chatTrackingStorage(
    {
      read: () => this.record ?? undefined,
      write: (record) => {
        this.record = record;
        this.chat.rowsWritten += 1;
      },
      remove: () => {
        this.goneAs = this.record?.game === null ? "closed" : "deleted";
        this.record = null;
        this.chat.removeAll();
      },
    },
    () => ({ messageCount: this.chat.storage.messages().length, now: this.now }),
  );

  constructor(given: LobbyGiven, random: ScriptedRandom) {
    this.random = random;
    this.now = v.parse(EpochMs, given.clock_ms ?? 0);
    for (const account of given.accounts ?? []) {
      const registration = registrationFromGiven(account, this.now);
      const changes = accountChangesFromGiven(account);
      this.addAccount(account.name, account.last_used_ms ?? 0, registration, changes);
    }
    const lobby = { ...EMPTY_LOBBY, today: countsTodayFromGiven(given, this.now, this) };
    const queued = queueStateFromGiven(given, lobby, (name) => this.identityNamed(name), this.now);
    this.lobby = queued.lobby;
    this.queue = queued.queue;
    this.emails = new LobbyEmails(given, (name) => this.identityNamed(name));
    this.history = new LobbyHistory(given, (name) => this.identityNamed(name));
    this.chat = new LobbyChat(chatFromGiven(given, (name) => this.identityNamed(name), this.now));
    this.record = givenRoomRecordOf(given, (name) => this.identityNamed(name), this.now);
    this.endedRoom = new EndedRoomRecords(
      endedRoomFromGiven(given, (name) => this.identityNamed(name), this.now),
    );
    this.otherRooms = (given.other_rooms ?? []).map((room) =>
      lobbyRoomFromGiven(room, (name) => this.identityNamed(name), this.now),
    );
    this.reportRooms();
    this.live = [this.record, ...this.otherRooms].flatMap(
      (room) => room?.players.map(({ playerId }) => playerId) ?? [],
    );
  }

  reportRooms(): void {
    this.lobby = lobbyWithRooms(this.lobby, [this.record, ...this.otherRooms]);
  }

  livePlayers(): ReadonlyArray<PlayerId> {
    return this.live;
  }

  identityNamed(name: string): Identity {
    return (this.accounts.get(name) ?? this.addAccount(name, this.now)).identity;
  }

  snapshot(): string {
    return JSON.stringify([this.record, this.otherRooms, [...this.accounts.keys()], this.queue]);
  }

  wait(ms: number): void {
    const until = v.parse(EpochMs, this.now + ms);
    const setNow = (now: EpochMs) => {
      this.now = now;
    };
    fireAlarmsUntil(this.storage, until, { live: this.live, setNow });
    this.now = until;
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
      if (this.record !== null && this.record.code !== code) {
        leaveRoomIfFreeIn(this.storage, playerId);
      }
    } else if (roomCode.success) {
      this.lobby = releasePlayer(this.lobby, playerId, roomCode.output);
    }
  }

  leaveFinishedRoom(playerId: PlayerId): void {
    if (this.record !== null) {
      leaveRoomIfFreeIn(this.storage, playerId);
    }
  }

  visitorJoins(visitor: string, code: unknown): void {
    this.visitorAwaits(visitor, (name) => {
      this.joinRoom(name, code);
    });
  }

  visitorAwaits(visitor: string, afterGuest: (name: string) => void): void {
    this.afterGuest.set(visitor, afterGuest);
    this.askGeneratedName();
  }

  askGeneratedName(): void {
    const asked = scriptedGeneratedName(this.random, this.takenKeys(), this.namesAsked);
    this.generatedName = asked.name;
    this.namesAsked = asked.namesAsked;
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
    this.addAccount(name, this.now, null, scriptedGuestChanges(this.random));
    this.afterGuest.get(visitor)?.(name);
  }

  openSite(name: string): void {
    const account = this.accounts.get(name);
    const state = account === undefined ? "expired" : loginStateOf(account.lastUsedMs, this.now);
    this.loggedIn = state === "expired" ? null : { as: name };
    if (account !== undefined && state === "record_use") {
      this.accounts.set(name, { ...account, lastUsedMs: this.now });
    }
  }

  sendRoomAction(name: string, action: Readonly<Record<string, unknown>>): void {
    this.send(name, { type: "room", action });
  }

  sendGameAction(name: string, action: Readonly<Record<string, unknown>>): void {
    const { playerId } = this.identityNamed(name);
    const seat = this.record?.game?.seats.find((candidate) => candidate.playerId === playerId);
    const stateVersion = seat?.stateVersion ?? 0;
    this.send(name, { type: "action", actionId: randomUUID(), stateVersion, action });
  }

  private send(name: string, message: Readonly<Record<string, unknown>>): void {
    const sender = this.identityNamed(name);
    const token = `token-of-${name}`;
    const text = JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token, ...message });
    const before = { record: this.record, messageCount: this.chat.storage.messages().length };
    this.chat.beginMessage(message);
    const outcome = receiveMessage(this.storage, {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(text),
      sender,
      now: this.now,
      randomFor: randomForNextAction,
      gameStart: {
        seed: 1,
        now: this.now,
        seatOrder: (players) =>
          seatOrderDrawn(this.random, players, (name) => this.identityNamed(name)),
        limitRejectionFor: (players) => countGameStartInLobby(this, players),
      },
      livePlayers: this.live,
      chat: this.chat.contextFor(() => grantChatQuotaInLobby(this)),
    });
    this.rejected = outcome.isRoomGone ? "room_not_found" : rejectionOfReply(outcome.reply);
    const played = actionsAddedBetween(before.record, this.record);
    this.lobby = withActionsAdded(this.lobby, played, this.now);
    if (!outcome.isRoomGone) {
      const delivery = { sender: name, accounts: this.accounts.values(), record: this.record };
      deliverRoomOutcome(this.messagesTo, { ...delivery, now: this.now }, outcome);
      this.chat.receive(this.messagesTo, outcome, { before, after: this.record });
    }
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

  private takenKeys(): ReadonlyArray<string> {
    return [...this.accounts.keys()].map(nameKeyOf);
  }

  private addAccount(
    name: string,
    lastUsedMs: number,
    registration: LobbyRegistration | null = null,
    changes = NO_ACCOUNT_CHANGES,
  ): LobbyAccount {
    const account = newLobbyAccount(name, lastUsedMs, registration, changes);
    this.accounts.set(name, account);
    return account;
  }
}
