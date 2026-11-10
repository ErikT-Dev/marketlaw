import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { endGame } from "../../../src/rules/endGame.ts";
import { saveGameRecord } from "../../../src/server/records/saveGameRecord.ts";
import { storedGameRecordOf } from "../../../src/server/records/storedGameRecordOf.ts";
import type { RoomGame } from "../../../src/server/room/RoomGame.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { GameId } from "../../../src/shared/GameId.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";

const ENDED_MS = 5000;

function endedGame(): RoomGame {
  const { game } = lobbyRoomFromGiven(
    {
      code: "K7QR2P",
      size: 3,
      public: true,
      players: ["Ann", "Bea", "Cat"],
      state: "ended",
      ended_ms: ENDED_MS,
    },
    (name) => ({ playerId: v.parse(PlayerId, crypto.randomUUID()), name }),
    v.parse(EpochMs, 0),
  );
  if (game === null) {
    throw new Error("the ended room has no game");
  }
  return game;
}

describe("saving game records", () => {
  it("stores the players' ids, the kind and the start and end times with the record", () => {
    const game = endedGame();
    const record = storedGameRecordOf(game);
    expect(record?.players).toEqual(game.seats.map(({ seat, playerId }) => ({ seat, playerId })));
    expect(record?.kind).toBe("casual");
    expect(record?.startedMs).toBe(game.saved.setup.startedAt);
    expect(record?.endedMs).toBe(ENDED_MS);
    expect(JSON.stringify(record)).not.toContain("Ann");
  });

  it("writes one record row and one row per player", async () => {
    const records = memoryGameRecordDatabase();
    const record = storedGameRecordOf(endedGame());
    if (record === null) {
      throw new Error("the ended game has no record");
    }
    await saveGameRecord(records.database, v.parse(GameId, crypto.randomUUID()), record);
    expect(records.rowCounts()).toEqual({ records: 1, players: 3 });
  });

  it("keeps no record of an abandoned game", () => {
    const game = endedGame();
    const abandoned = endGame(game.saved.state, ENDED_MS, "everyone_left");
    expect(storedGameRecordOf({ ...game, saved: { ...game.saved, state: abandoned } })).toBe(null);
  });
});
