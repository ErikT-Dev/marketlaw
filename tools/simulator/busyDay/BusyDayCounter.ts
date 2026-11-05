import { EMPTY_LOBBY } from "../../../src/server/lobby/EMPTY_LOBBY.ts";
import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { alarmChangeFor } from "../../../src/server/room/alarmChangeFor.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import type { BusyDayCount } from "./BusyDayCount.ts";
import type { BusyDayRows } from "./BusyDayRows.ts";

export class BusyDayCounter {
  lobby: LobbyRecord = EMPTY_LOBBY;
  record: RoomRecord | undefined;
  private alarm: number | null = null;
  private rows: BusyDayRows = { room: 0, alarm: 0, lobby: 0, database: 0 };
  private rowsRead = 0;
  readonly storage: RoomStorage = {
    read: () => this.readRecord(),
    write: (record) => {
      this.record = record;
      this.count("room");
    },
    remove: () => {
      this.record = undefined;
      this.count("room");
    },
  };

  readonly gameStorage: RoomStorage = {
    read: () => this.readRecord(),
    write: (record) => {
      this.record = record;
    },
    remove: () => {
      this.storage.remove();
    },
  };

  count(kind: keyof BusyDayRows, rows = 1): void {
    this.rows = { ...this.rows, [kind]: this.rows[kind] + rows };
  }

  countReads(rows: number): void {
    this.rowsRead += rows;
  }

  changeLobby(next: LobbyRecord): void {
    if (JSON.stringify(next) !== JSON.stringify(this.lobby)) {
      this.lobby = next;
      this.count("lobby");
    }
  }

  syncAlarm(): void {
    const change = alarmChangeFor(this.alarm, this.record ?? null);
    if (change.kind !== "keep") {
      this.alarm = change.kind === "set" ? change.at : null;
      this.count("alarm");
    }
  }

  newRoom(): void {
    this.record = undefined;
    this.alarm = null;
  }

  total(): BusyDayCount {
    return { written: this.rows, rowsRead: this.rowsRead };
  }

  private readRecord(): RoomRecord | undefined {
    this.rowsRead += 1;
    return this.record;
  }
}
