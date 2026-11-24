import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../../src/shared/testing/TEST_PLAYER_ICON.ts";
import { describe, expect, it } from "vitest";
import { keptReplayRecordText } from "../../../src/server/replays/keptReplayRecordText.ts";
import { removeOldReplayRecords } from "../../../src/server/replays/removeOldReplayRecords.ts";
import { REPLAY_RECORD_KEPT_MS } from "../../../src/server/replays/REPLAY_RECORD_KEPT_MS.ts";
import { saveReplayRecord } from "../../../src/server/replays/saveReplayRecord.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { memoryReplayRecordDatabase } from "./memoryReplayRecordDatabase.ts";

const ONE_SECOND_MS = 1000;

function roomEndedAt(code: string, endedMs: number): RoomRecord {
  return lobbyRoomFromGiven(
    { code, size: 2, public: true, players: [], state: "ended", ended_ms: endedMs },
    (name) => ({ playerId: v.parse(PlayerId, crypto.randomUUID()), name, icon: TEST_PLAYER_ICON }),
    v.parse(EpochMs, 0),
  );
}

async function save(records: ReturnType<typeof memoryReplayRecordDatabase>, room: RoomRecord) {
  const saved = room.game?.saved;
  if (saved === undefined) {
    throw new Error("the ended room has no game");
  }
  await saveReplayRecord(records.database, room.code, saved);
}

describe("replay record retention", () => {
  it("removes records that ended 30 days ago and keeps younger ones", async () => {
    const records = memoryReplayRecordDatabase();
    const old = roomEndedAt("K7QR2P", 0);
    const young = roomEndedAt("M4TX9C", ONE_SECOND_MS);
    await save(records, old);
    await save(records, young);
    await removeOldReplayRecords(records.database, REPLAY_RECORD_KEPT_MS);
    expect(records.storedCount()).toBe(1);
    expect(await keptReplayRecordText(records.database, old.code, REPLAY_RECORD_KEPT_MS)).toBe(
      null,
    );
    expect(
      await keptReplayRecordText(records.database, young.code, REPLAY_RECORD_KEPT_MS),
    ).not.toBe(null);
  });

  it("does not export a record older than 30 days that the daily job has not removed yet", async () => {
    const records = memoryReplayRecordDatabase();
    const room = roomEndedAt("K7QR2P", 0);
    await save(records, room);
    expect(await keptReplayRecordText(records.database, room.code, REPLAY_RECORD_KEPT_MS)).toBe(
      null,
    );
    expect(records.storedCount()).toBe(1);
  });
});
