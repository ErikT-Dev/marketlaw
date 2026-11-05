import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { claimPlayer } from "./claimPlayer";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import { forgetPlayer } from "./forgetPlayer";
import { publicRoomsOf } from "./publicRoomsOf";
import { releasePlayer } from "./releasePlayer";
import type { RoomSummary } from "./RoomSummary";
import { withRoomSummary } from "./withRoomSummary";

const ANN = v.parse(PlayerId, crypto.randomUUID());
const BEA = v.parse(PlayerId, crypto.randomUUID());
const FIRST = v.parse(RoomCode, "K7QR2P");
const SECOND = v.parse(RoomCode, "M4TX9C");
const NOW = v.parse(EpochMs, 1_761_436_800_000);

function summary(changes: Partial<RoomSummary> = {}): RoomSummary {
  return {
    code: FIRST,
    size: 3,
    isPublic: true,
    isWaiting: true,
    isOver: false,
    players: [
      { playerId: ANN, name: "Ann" },
      { playerId: BEA, name: "Bea" },
    ],
    freePlayers: [],
    ...changes,
  };
}

describe("the lobby", () => {
  it("lets a claim for another room fail while the player is in a room", () => {
    const lobby = withRoomSummary(EMPTY_LOBBY, FIRST, summary());
    expect(claimPlayer(lobby, ANN, SECOND, NOW)).toEqual({ isOk: false, error: "busy_elsewhere" });
    expect(claimPlayer(lobby, ANN, FIRST, NOW)).toEqual({ isOk: true, value: lobby });
  });

  it("releases a claim whose join failed but keeps players who are in the room", () => {
    const claimed = claimPlayer(EMPTY_LOBBY, ANN, SECOND, NOW);
    if (!claimed.isOk) {
      throw new Error("claim failed");
    }
    expect(releasePlayer(claimed.value, ANN, SECOND)).toEqual(EMPTY_LOBBY);
    const inRoom = withRoomSummary(EMPTY_LOBBY, FIRST, summary());
    expect(releasePlayer(inRoom, ANN, FIRST)).toBe(inRoom);
  });

  it("keeps a pending claim when its room reports without the claimed player yet", () => {
    const claimed = claimPlayer(EMPTY_LOBBY, ANN, FIRST, NOW);
    if (!claimed.isOk) {
      throw new Error("claim failed");
    }
    const reported = withRoomSummary(
      claimed.value,
      FIRST,
      summary({ players: [{ playerId: BEA, name: "Bea" }] }),
    );
    expect(claimPlayer(reported, ANN, SECOND, NOW)).toEqual({
      isOk: false,
      error: "busy_elsewhere",
    });
  });

  it("frees a player who left the room and forgets a stale entry", () => {
    const lobby = withRoomSummary(EMPTY_LOBBY, FIRST, summary());
    const left = withRoomSummary(
      lobby,
      FIRST,
      summary({ players: [{ playerId: BEA, name: "Bea" }] }),
    );
    expect(claimPlayer(left, ANN, SECOND, NOW).isOk).toBe(true);
    const forgotten = forgetPlayer(lobby, ANN, FIRST);
    expect(claimPlayer(forgotten, ANN, SECOND, NOW).isOk).toBe(true);
    expect(publicRoomsOf(forgotten)[0]?.playerNames).toEqual(["Bea"]);
  });

  it("frees the players and drops the room when its game ends or it closes", () => {
    const lobby = withRoomSummary(EMPTY_LOBBY, FIRST, summary());
    expect(withRoomSummary(lobby, FIRST, summary({ isWaiting: false, isOver: true }))).toEqual(
      EMPTY_LOBBY,
    );
    expect(withRoomSummary(lobby, FIRST, null)).toEqual(EMPTY_LOBBY);
  });

  it("lists only public rooms that are still waiting", () => {
    const lobby = [
      summary(),
      summary({ code: SECOND, isPublic: false, players: [] }),
      summary({ code: v.parse(RoomCode, "Z2Z2Z2"), isWaiting: false, players: [] }),
    ].reduce((record, room) => withRoomSummary(record, room.code, room), EMPTY_LOBBY);
    expect(publicRoomsOf(lobby)).toEqual([
      { code: FIRST, size: 3, ownerName: "Ann", playerNames: ["Ann", "Bea"] },
    ]);
  });
});
