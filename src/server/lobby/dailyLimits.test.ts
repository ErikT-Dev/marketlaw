import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { claimPlayer } from "./claimPlayer";
import { countGameStart } from "./countGameStart";
import { dayOf } from "./dayOf";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import { LOBBY_RECORD_SCHEMA } from "./LOBBY_RECORD_SCHEMA";
import type { LobbyRecord } from "./LobbyRecord";
import { siteGameLimitOf } from "./siteGameLimitOf";

const ANN = v.parse(PlayerId, crypto.randomUUID());
const CODE = v.parse(RoomCode, "K7QR2P");
const MIDNIGHT = v.parse(EpochMs, 1_761_436_800_000);
const LAST_MS_OF_DAY = v.parse(EpochMs, MIDNIGHT + 86_399_999);
const NEXT_MIDNIGHT = v.parse(EpochMs, MIDNIGHT + 86_400_000);

function lobbyWith(actions: number, gameStarts: number): LobbyRecord {
  return {
    ...EMPTY_LOBBY,
    today: {
      day: dayOf(MIDNIGHT),
      players: [{ playerId: ANN, actions, gameStarts }],
      siteGameStarts: 0,
    },
  };
}

describe("the daily limits for joining a room", () => {
  it("rejects a player at 2000 actions today and lets one at 1999 join", () => {
    expect(claimPlayer(lobbyWith(2000, 0), ANN, CODE, MIDNIGHT)).toEqual({
      isOk: false,
      error: "daily_action_limit",
    });
    expect(claimPlayer(lobbyWith(1999, 0), ANN, CODE, MIDNIGHT).isOk).toBe(true);
  });

  it("rejects a player who started 10 games today and lets one who started 9 join", () => {
    expect(claimPlayer(lobbyWith(0, 10), ANN, CODE, LAST_MS_OF_DAY)).toEqual({
      isOk: false,
      error: "daily_game_start_limit",
    });
    expect(claimPlayer(lobbyWith(0, 9), ANN, CODE, MIDNIGHT).isOk).toBe(true);
  });

  it("reads the counts of an earlier day as zero", () => {
    expect(claimPlayer(lobbyWith(2000, 10), ANN, CODE, NEXT_MIDNIGHT).isOk).toBe(true);
  });

  it("keeps a player in the room they already hold whatever their counts", () => {
    const holding = { ...lobbyWith(2000, 10), busy: [{ playerId: ANN, code: CODE }] };
    expect(claimPlayer(holding, ANN, CODE, MIDNIGHT)).toEqual({ isOk: true, value: holding });
  });

  it("reads a lobby record saved before the daily counts with no counts", () => {
    const saved = { rooms: [], busy: [], staying: [] };
    expect(v.parse(LOBBY_RECORD_SCHEMA, saved)).toEqual(EMPTY_LOBBY);
  });
});

describe("counting a game start", () => {
  const BEA = v.parse(PlayerId, crypto.randomUUID());
  const LIMITS = { now: MIDNIGHT, siteGamesPerDay: 50 };

  it("counts the start for the site and for every player", () => {
    const counted = countGameStart(lobbyWith(5, 3), [ANN, BEA], LIMITS);
    expect(counted.isOk ? counted.value.today : null).toEqual({
      day: dayOf(MIDNIGHT),
      players: [
        { playerId: ANN, actions: 5, gameStarts: 4 },
        { playerId: BEA, actions: 0, gameStarts: 1 },
      ],
      siteGameStarts: 1,
    });
  });

  it("names every player over their own limit and counts nothing", () => {
    expect(countGameStart(lobbyWith(0, 10), [BEA, ANN], LIMITS)).toEqual({
      isOk: false,
      error: {
        kind: "players_over_limit",
        players: [{ playerId: ANN, reason: "daily_game_start_limit" }],
      },
    });
  });

  it("refuses the 51st game of the day and allows it the next day", () => {
    const full = { ...lobbyWith(0, 0), today: { ...lobbyWith(0, 0).today, siteGameStarts: 50 } };
    expect(countGameStart(full, [ANN, BEA], LIMITS)).toEqual({
      isOk: false,
      error: { kind: "site_game_limit" },
    });
    expect(countGameStart(full, [ANN, BEA], { ...LIMITS, now: NEXT_MIDNIGHT }).isOk).toBe(true);
  });

  it("uses 50 games a day unless the environment sets a test site limit", () => {
    expect(siteGameLimitOf({})).toBe(50);
    expect(siteGameLimitOf({ TEST_SITE_GAMES_PER_DAY: "not a number" })).toBe(50);
    expect(siteGameLimitOf({ TEST_SITE_GAMES_PER_DAY: "1000000" })).toBe(1_000_000);
  });
});
