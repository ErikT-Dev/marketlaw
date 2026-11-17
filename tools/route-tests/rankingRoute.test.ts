import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { RankingResponse } from "../../src/shared/api/RankingResponse.ts";
import { PlayerId } from "../../src/shared/PlayerId.ts";
import { postToRoute } from "./postToRoute.ts";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";
import { routeTestDatabaseOf } from "./routeTestDatabaseOf.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const FILLER_PLAYERS = 60;

let server: TestHarness;

async function rankingFor(token: string | null, page: number | "mine") {
  const answer = await postToRoute(server, "/api/ranking", { token, page });
  return { status: answer.status, ranking: v.parse(RankingResponse, answer.body) };
}

async function playerIdNamed(db: RouteTestDatabase, name: string): Promise<PlayerId> {
  const { results } = await db.prepare("SELECT id FROM players WHERE name = ?").bind(name).all();
  return v.parse(v.tuple([v.object({ id: PlayerId })]), results)[0].id;
}

async function giveRating(db: RouteTestDatabase, playerId: string, rating: number, games: number) {
  await db
    .prepare(
      "INSERT INTO ratings (player_id, rating, ranked_games, highest_rating) VALUES (?, ?, ?, ?)",
    )
    .bind(playerId, rating, games, rating)
    .run();
}

async function addRankedFillers(db: RouteTestDatabase) {
  for (let index = 0; index < FILLER_PLAYERS; index += 1) {
    const id = crypto.randomUUID();
    const name = `Filler${String(index).padStart(2, "0")}`;
    await db
      .prepare(
        "INSERT INTO players (id, name, name_key, created_ms, kind) VALUES (?, ?, ?, 0, 'registered')",
      )
      .bind(id, name, name.toLowerCase())
      .run();
    await giveRating(db, id, 900, 1);
  }
}

async function signUp(username: string): Promise<string> {
  const signup = await postToRoute(server, "/api/signups", {
    username,
    email: `${username}@example.com`,
    password: "quiet-harbour-71",
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  return tokenOf(signup);
}

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the ranking route", () => {
  it(
    "lists registered players with a ranked game 50 per page and finds the viewer's place",
    async () => {
      const db = await routeTestDatabaseOf(server);
      const annToken = await signUp("Rankann");
      const beaToken = await signUp("Rankbea");
      const guest = await postToRoute(server, "/api/guests", {
        name: "Rankguest",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      await giveRating(db, await playerIdNamed(db, "Rankguest"), 1500, 4);
      await giveRating(db, await playerIdNamed(db, "Rankann"), 800, 2);
      await addRankedFillers(db);
      const firstPage = await rankingFor(null, 1);
      expect(firstPage.status).toBe(200);
      expect(firstPage.ranking).toMatchObject({
        page: 1,
        pageCount: 2,
        standing: { kind: "logged_out" },
      });
      expect(firstPage.ranking.entries).toHaveLength(50);
      expect(firstPage.ranking.entries[0]).toMatchObject({ place: 1, username: "Filler00" });
      const mine = await rankingFor(annToken, "mine");
      expect(mine.ranking).toMatchObject({ page: 2, standing: { kind: "placed", place: 61 } });
      expect(mine.ranking.entries.map(({ place }) => place)).toEqual(
        [...Array(11).keys()].map((index) => 51 + index),
      );
      expect(mine.ranking.entries.at(-1)).toMatchObject({
        username: "Rankann",
        rating: 800,
        rankedGames: 2,
      });
      expect((await rankingFor(annToken, 9)).ranking).toMatchObject({ page: 2, pageCount: 2 });
      expect((await rankingFor(beaToken, "mine")).ranking).toMatchObject({
        page: 1,
        standing: { kind: "no_ranked_game" },
      });
      expect((await rankingFor(tokenOf(guest), 1)).ranking.standing).toEqual({ kind: "guest" });
      expect((await rankingFor("not-a-token", 1)).ranking.standing).toEqual({
        kind: "logged_out",
      });
    },
    STARTING_MS,
  );

  it("rejects a malformed request", async () => {
    expect((await postToRoute(server, "/api/ranking", { page: 0, token: null })).status).toBe(400);
    expect((await postToRoute(server, "/api/ranking", { page: 1 })).status).toBe(400);
  });
});
