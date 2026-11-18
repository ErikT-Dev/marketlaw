import { randomUUID } from "node:crypto";
import * as v from "valibot";
import type { TutorialAction } from "../../../src/rules/tutorial/TutorialAction.ts";
import type { ConnectionState } from "../../../src/server/room/ConnectionState.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { ROOM_TIMES } from "../../../src/server/room/ROOM_TIMES.ts";
import { receiveTutorialMessage } from "../../../src/server/tutorial/receiveTutorialMessage.ts";
import { startTutorialIn } from "../../../src/server/tutorial/startTutorialIn.ts";
import type { TutorialRecord } from "../../../src/server/tutorial/TutorialRecord.ts";
import type { TutorialStorage } from "../../../src/server/tutorial/TutorialStorage.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { parseTutorialClientMessage } from "../../../src/shared/protocol/parseTutorialClientMessage.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import { memoryGameRecordDatabase } from "../lobby/memoryGameRecordDatabase.ts";
import { roomTokenOf } from "../room/roomTokenOf.ts";
import { tutorialMessageText } from "./tutorialMessageText.ts";

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
      this.record = undefined;
    },
  };

  identityNamed(name: string): Identity {
    const known = this.accounts.get(name);
    if (known !== undefined) {
      return known;
    }
    const identity = { playerId: v.parse(PlayerId, randomUUID()), name };
    this.accounts.set(name, identity);
    this.records.addPlayer(identity.playerId);
    return identity;
  }

  start(name: string): void {
    this.rowsAtStart = this.rowsWritten;
    startTutorialIn(this.storage, this.identityNamed(name), this.now);
    this.setAlarm(this.now + ROOM_TIMES.tutorialAwayMs);
    this.isConnected = true;
    this.connection = NO_IDENTITY;
  }

  send(name: string, action: TutorialAction | { readonly type: "leave_tutorial" }): void {
    const before = JSON.stringify(this.record);
    const text = tutorialMessageText(action, {
      token: roomTokenOf(name),
      actionId: `auto-${String(this.nextActionNumber++)}`,
      stateVersion: this.record?.stateVersion ?? 0,
    });
    const outcome = receiveTutorialMessage(this.storage, {
      connection: this.connection,
      parsed: parseTutorialClientMessage(text),
      sender: this.accounts.get(name) ?? null,
      now: this.now,
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
    if (this.record !== undefined) {
      this.setAlarm(this.now + ROOM_TIMES.tutorialAwayMs);
    }
  }

  wait(ms: number): void {
    this.now = v.parse(EpochMs, this.now + ms);
    if (this.alarmAt !== null && this.alarmAt <= this.now) {
      this.alarmAt = null;
      if (!this.isConnected) {
        this.storage.remove();
      }
    }
  }

  private setAlarm(at: number): void {
    this.alarmAt = at;
    this.rowsWritten += 1;
  }
}
