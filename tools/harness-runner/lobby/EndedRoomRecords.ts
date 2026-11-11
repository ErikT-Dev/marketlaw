import { saveGameRecordIfEnded } from "../../../src/server/records/saveGameRecordIfEnded.ts";
import { saveReplayRecordIfEnded } from "../../../src/server/replays/saveReplayRecordIfEnded.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";
import { memoryReplayRecordDatabase } from "./memoryReplayRecordDatabase.ts";

export class EndedRoomRecords {
  readonly room: RoomRecord | null;
  readonly games = memoryGameRecordDatabase();
  readonly replays = memoryReplayRecordDatabase();
  readonly saved: Promise<void>;

  constructor(room: RoomRecord | null) {
    this.room = room;
    this.saved = room === null ? Promise.resolve() : this.saveRecordsOf(room);
  }

  private async saveRecordsOf(room: RoomRecord): Promise<void> {
    await saveReplayRecordIfEnded(this.replays.database, null, room);
    await saveGameRecordIfEnded(this.games.database, null, room);
  }
}
