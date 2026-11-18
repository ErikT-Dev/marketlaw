import { randomUUID } from "node:crypto";
import * as v from "valibot";
import type { TutorialAction } from "../../../src/rules/tutorial/TutorialAction.ts";
import { countTutorialStart } from "../../../src/server/lobby/countTutorialStart.ts";
import { EMPTY_LOBBY } from "../../../src/server/lobby/EMPTY_LOBBY.ts";
import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { releasePlayer } from "../../../src/server/lobby/releasePlayer.ts";
import { siteTutorialLimitOf } from "../../../src/server/lobby/siteTutorialLimitOf.ts";
import { TUTORIAL_PLACE } from "../../../src/server/lobby/TUTORIAL_PLACE.ts";
import type { ConnectionState } from "../../../src/server/room/ConnectionState.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { ROOM_TIMES } from "../../../src/server/room/ROOM_TIMES.ts";
import { isTutorialAbandoned } from "../../../src/server/tutorial/isTutorialAbandoned.ts";
import { receiveTutorialMessage } from "../../../src/server/tutorial/receiveTutorialMessage.ts";
import { restartingPlayerOf } from "../../../src/server/tutorial/restartingPlayerOf.ts";
import { startTutorialIn } from "../../../src/server/tutorial/startTutorialIn.ts";
import { tutorialAlarmAfterClose } from "../../../src/server/tutorial/tutorialAlarmAfterClose.ts";
import type { TutorialRecord } from "../../../src/server/tutorial/TutorialRecord.ts";
import type { TutorialStorage } from "../../../src/server/tutorial/TutorialStorage.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { parseTutorialClientMessage } from "../../../src/shared/protocol/parseTutorialClientMessage.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import { memoryGameRecordDatabase } from "../lobby/memoryGameRecordDatabase.ts";
import { roomTokenOf } from "../room/roomTokenOf.ts";
import { tutorialMessageText } from "./tutorialMessageText.ts";
import type { TutorialSessionLinks } from "./TutorialSessionLinks.ts";

const NO_IDENTITY: ConnectionState = { identity: null, rejectionTimes: [] };

export class TutorialSession {
  record: TutorialRecord | undefined;
  now = v.parse(EpochMs, 0);
  rowsWritten = 0;
  lastReply: ServerMessage | null = null;
  isLastStepUnchanged = false;
  fullTutorialRows: number | null = null;
  readonly records = memoryGameRecordDatabase();
  private readonly accounts = new Map<string, Identity>();
  private ownLobby: LobbyRecord = EMPTY_LOBBY;
  private readonly links: TutorialSessionLinks;
  private alarmAt: number | null = null;
  private isConnected = false;
  private connection = NO_IDENTITY;
  private rowsAtStart = 0;
  private nextActionNumber = 1;
  private readonly storage: TutorialStorage = {
    read: () => this.record,
    write: (record) => {
      this.record = record;
      this.rowsWritten += 1;
    },
    remove: () => {
      if (this.record !== undefined) {
        this.releaseInLobby(this.record.player.playerId);
      }
      this.record = undefined;
    },
  };

  constructor(links: TutorialSessionLinks | null = null) {
    this.links = links ?? {
      identityNamed: (name) => this.ownIdentityNamed(name),
      lobby: {
        read: () => this.ownLobby,
        write: (lobby) => {
          this.ownLobby = lobby;
        },
      },
    };
  }

  identityNamed(name: string): Identity {
    return this.links.identityNamed(name);
  }

  start(name: string): ReasonCode | null {
    const identity = this.identityNamed(name);
    const refusal = this.countStart(identity.playerId);
    if (refusal !== null) {
      this.lastReply = {
        type: "rejected",
        protocolVersion: PROTOCOL_VERSION,
        actionId: null,
        code: refusal,
        sendAgainAt: null,
      };
      return refusal;
    }
    this.rowsAtStart = this.rowsWritten;
    startTutorialIn(this.storage, identity, this.now);
    this.setAlarm(this.now + ROOM_TIMES.tutorialAwayMs);
    this.isConnected = true;
    this.connection = NO_IDENTITY;
    return null;
  }

  send(name: string, action: TutorialAction | { readonly type: "leave_tutorial" }): void {
    const before = JSON.stringify(this.record);
    const text = tutorialMessageText(action, {
      token: roomTokenOf(name),
      actionId: `auto-${String(this.nextActionNumber++)}`,
      stateVersion: this.record?.stateVersion ?? 0,
    });
    const parsed = parseTutorialClientMessage(text);
    const sender = this.identityNamed(name);
    const restarting = restartingPlayerOf(this.record, parsed, sender);
    const outcome = receiveTutorialMessage(this.storage, {
      connection: this.connection,
      parsed,
      sender,
      now: this.now,
      restartRefusal: restarting === null ? null : this.countStart(restarting),
    });
    this.lastReply = outcome.reply;
    if (outcome.kind === "open") {
      this.connection = outcome.connection;
    }
    this.isLastStepUnchanged = before === JSON.stringify(this.record);
    if (this.fullTutorialRows === null && this.record?.tutorial.stage === "complete") {
      this.fullTutorialRows = this.rowsWritten - this.rowsAtStart;
    }
  }

  disconnect(): void {
    this.isConnected = false;
    const alarmAt = tutorialAlarmAfterClose(this.record, [], this.now);
    if (alarmAt !== null) {
      this.setAlarm(alarmAt);
    }
  }

  wait(ms: number): void {
    this.now = v.parse(EpochMs, this.now + ms);
    if (this.alarmAt !== null && this.alarmAt <= this.now) {
      this.alarmAt = null;
      if (isTutorialAbandoned(this.record, this.isConnected ? [this.connection] : [])) {
        this.storage.remove();
      }
    }
  }

  private countStart(playerId: PlayerId): ReasonCode | null {
    const counted = countTutorialStart(this.links.lobby.read(), playerId, {
      now: this.now,
      siteTutorialsPerDay: siteTutorialLimitOf({}),
    });
    if (!counted.isOk) {
      return counted.error;
    }
    this.links.lobby.write(counted.value);
    return null;
  }

  private releaseInLobby(playerId: PlayerId): void {
    this.links.lobby.write(releasePlayer(this.links.lobby.read(), playerId, TUTORIAL_PLACE));
  }

  private ownIdentityNamed(name: string): Identity {
    const known = this.accounts.get(name);
    if (known !== undefined) {
      return known;
    }
    const identity = { playerId: v.parse(PlayerId, randomUUID()), name };
    this.accounts.set(name, identity);
    this.records.addPlayer(identity.playerId);
    return identity;
  }

  private setAlarm(at: number): void {
    this.alarmAt = at;
    this.rowsWritten += 1;
  }
}
