import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRATIONS_DIRECTORY = "./migrations";
const FINAL_DATA_WIPE = "0016_final_data_wipe.sql";
const RANKED_GAME = "11111111-1111-4111-8111-111111111111";
const OLD_RANKED_GAME = "22222222-2222-4222-8222-222222222222";
const CASUAL_GAME = "33333333-3333-4333-8333-333333333333";
const TEST_ROOM_GAME = "44444444-4444-4444-8444-444444444444";
const SAME_TIMES_CASUAL_GAME = "55555555-5555-4555-8555-555555555555";
const NEW_UNITS_SEAT = { seat: 1, income: 120, funds: 230, cardsInHand: 4, fundsAndHand: null };
const OLD_UNITS_SEATS = [
  { seat: 1, income: 12, fundsAndHand: 27, score: 101.5 },
  { seat: 2, income: 9, fundsAndHand: 31, score: 88.25 },
];

const PRE_LAUNCH_ACCOUNTS = [
  ["Ranked", "registered"],
  ["RankedGuest", "guest"],
  ["CasualOnly", "registered"],
  ["NeverPlayed", "guest"],
  ["TestSeat", "guest"],
  ["TestOpponent", "registered"],
] as const;

const database = new DatabaseSync(":memory:");

function applyMigrations(names: ReadonlyArray<string>) {
  for (const name of names) {
    database.exec(readFileSync(`${MIGRATIONS_DIRECTORY}/${name}`, "utf8"));
  }
}

function replayRecordText(schemaVersion: number, startedAt: number, kind?: string) {
  return JSON.stringify({ schemaVersion, seed: 7, setup: { startedAt, kind }, actionLog: [] });
}

function addPlayer(id: string, kind: string) {
  database
    .prepare("INSERT INTO players (id, name, name_key, created_ms, kind) VALUES (?, ?, ?, 0, ?)")
    .run(id, id, id.toLowerCase(), kind);
  database
    .prepare(
      "INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms) VALUES (?, ?, 0, 0)",
    )
    .run(`token-${id}`, id);
  database
    .prepare(
      "INSERT INTO email_links (player_id, kind, token_hash, expires_ms) VALUES (?, 'confirm', ?, 0)",
    )
    .run(id, `link-${id}`);
  database
    .prepare(
      "INSERT INTO ratings (player_id, rating, ranked_games, highest_rating) VALUES (?, 1000, 1, 1000)",
    )
    .run(id);
}

function addGame(options: {
  readonly id: string;
  readonly kind: string;
  readonly startedMs: number;
  readonly endedMs: number;
  readonly players: ReadonlyArray<string>;
  readonly seats?: ReadonlyArray<object>;
}) {
  const { id, kind, startedMs, endedMs, players, seats = [NEW_UNITS_SEAT] } = options;
  const record = JSON.stringify({ kind, startedMs, endedMs, turns: 9, winner: 1, seats });
  database
    .prepare("INSERT INTO game_records (id, ended_ms, record) VALUES (?, ?, ?)")
    .run(id, endedMs, record);
  for (const playerId of players) {
    database
      .prepare("INSERT INTO game_record_players (player_id, ended_ms, game_id) VALUES (?, ?, ?)")
      .run(playerId, endedMs, id);
  }
}

function addReplay(roomCode: string, endedMs: number, record: string) {
  database
    .prepare("INSERT INTO replay_records (room_code, ended_ms, record) VALUES (?, ?, ?)")
    .run(roomCode, endedMs, record);
}

function addGames() {
  const ranked = ["Ranked", "RankedGuest", "Deleted"];
  addGame({ id: RANKED_GAME, kind: "ranked", startedMs: 100, endedMs: 200, players: ranked });
  const old = { startedMs: 50, endedMs: 90, players: ["Ranked", "RankedGuest"] };
  addGame({ id: OLD_RANKED_GAME, kind: "ranked", ...old, seats: OLD_UNITS_SEATS });
  const casual = ["Ranked", "CasualOnly"];
  addGame({ id: CASUAL_GAME, kind: "casual", startedMs: 100, endedMs: 300, players: casual });
  const testRoom = ["TestSeat", "TestOpponent", "Ranked"];
  addGame({ id: TEST_ROOM_GAME, kind: "ranked", startedMs: 400, endedMs: 500, players: testRoom });
  const sameTimes = { startedMs: 100, endedMs: 200, players: ["CasualOnly"] };
  addGame({ id: SAME_TIMES_CASUAL_GAME, kind: "casual", ...sameTimes });
}

function addReplays() {
  addReplay("RANKED", 200, replayRecordText(20, 100, "ranked"));
  addReplay("OLDRANKED", 90, replayRecordText(19, 50));
  addReplay("CASUAL", 300, replayRecordText(20, 100, "casual"));
  addReplay("SAMEEND", 200, replayRecordText(20, 150, "ranked"));
  addReplay("SAMETIMES", 200, replayRecordText(20, 100, "casual"));
  addReplay("TESTROOM", 500, replayRecordText(20, 400, "ranked"));
  addReplay("PUBLIC", 200, replayRecordText(21, 100, "ranked"));
}

function addPreLaunchData() {
  for (const [id, kind] of PRE_LAUNCH_ACCOUNTS) {
    addPlayer(id, kind);
  }
  database.exec("UPDATE players SET is_test_room_seat = 1 WHERE id = 'TestSeat'");
  addGames();
  addReplays();
  database.exec(
    "INSERT INTO email_counts (counted_key, day, emails) VALUES ('site', 1, 3);" +
      "INSERT INTO unknown_login_failures (key_hash, failed_logins_ms, forget_after_ms) VALUES ('k', '[]', 0);" +
      "INSERT INTO test_outbox (sent_ms, to_address, subject, text) VALUES (0, 'a@example.com', 's', 't');",
  );
}

function columnOf(sql: string): ReadonlyArray<unknown> {
  return database
    .prepare(sql)
    .all()
    .map((row) => Object.values(row)[0]);
}

function recordOf(id: string): unknown {
  const row = database.prepare("SELECT record FROM game_records WHERE id = ?").get(id);
  return JSON.parse(String(row?.["record"]));
}

describe("the final data wipe", () => {
  beforeAll(() => {
    const names = readdirSync(MIGRATIONS_DIRECTORY).sort();
    applyMigrations(names.filter((name) => name < FINAL_DATA_WIPE));
    addPreLaunchData();
    applyMigrations([FINAL_DATA_WIPE]);
  });

  it("keeps only the finished ranked game records without a test-room seat and their players", () => {
    expect(columnOf("SELECT id FROM game_records ORDER BY id")).toEqual([
      RANKED_GAME,
      OLD_RANKED_GAME,
    ]);
    expect(
      columnOf("SELECT player_id || ' ' || game_id FROM game_record_players ORDER BY 1"),
    ).toEqual([
      `Deleted ${RANKED_GAME}`,
      `Ranked ${RANKED_GAME}`,
      `Ranked ${OLD_RANKED_GAME}`,
      `RankedGuest ${RANKED_GAME}`,
      `RankedGuest ${OLD_RANKED_GAME}`,
    ]);
  });

  it("keeps every account that played a kept ranked game with its logins ratings and email links", () => {
    const kept = ["Ranked", "RankedGuest"];
    expect(columnOf("SELECT id FROM players ORDER BY id")).toEqual(kept);
    expect(columnOf("SELECT player_id FROM logins ORDER BY player_id")).toEqual(kept);
    expect(columnOf("SELECT player_id FROM email_links ORDER BY player_id")).toEqual(kept);
    expect(columnOf("SELECT player_id FROM ratings ORDER BY player_id")).toEqual(kept);
  });

  it("raises the income of a ranked record saved in the old units ten times and keeps the rest", () => {
    expect(recordOf(OLD_RANKED_GAME)).toEqual({
      kind: "ranked",
      startedMs: 50,
      endedMs: 90,
      turns: 9,
      winner: 1,
      seats: [
        { seat: 1, income: 120, fundsAndHand: 27, score: 101.5 },
        { seat: 2, income: 90, fundsAndHand: 31, score: 88.25 },
      ],
    });
  });

  it("keeps a ranked record saved in the current units unchanged", () => {
    expect(recordOf(RANKED_GAME)).toEqual({
      kind: "ranked",
      startedMs: 100,
      endedMs: 200,
      turns: 9,
      winner: 1,
      seats: [NEW_UNITS_SEAT],
    });
  });

  it("keeps only the stored moves of the kept ranked games and raises version 20 to 21", () => {
    expect(
      columnOf(
        "SELECT room_code || ' ' || json_extract(record, '$.schemaVersion') FROM replay_records ORDER BY room_code",
      ),
    ).toEqual(["OLDRANKED 19", "PUBLIC 21", "RANKED 21"]);
    expect(columnOf("SELECT json_extract(record, '$.seed') FROM replay_records")).toEqual([
      7, 7, 7,
    ]);
  });

  it("keeps the stored moves of a version 21 game unchanged", () => {
    expect(columnOf("SELECT record FROM replay_records WHERE room_code = 'PUBLIC'")).toEqual([
      replayRecordText(21, 100, "ranked"),
    ]);
  });

  it("deletes the daily counts the login failures and the test outbox", () => {
    expect(columnOf("SELECT COUNT(*) FROM email_counts")).toEqual([0]);
    expect(columnOf("SELECT COUNT(*) FROM unknown_login_failures")).toEqual([0]);
    expect(columnOf("SELECT COUNT(*) FROM test_outbox")).toEqual([0]);
  });
});
