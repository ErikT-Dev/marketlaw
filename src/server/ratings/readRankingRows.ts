import * as v from "valibot";
import { RankingEntry } from "../../shared/api/RankingEntry";
import type { RankingPage } from "../../shared/api/RankingPage";
import type { PlayerId } from "../../shared/PlayerId";
import type { RecordReadDatabase } from "../records/RecordReadDatabase";
import { RANKING_PAGE_SIZE } from "./RANKING_PAGE_SIZE";
import type { RankingRows } from "./RankingRows";

const VIEWERS_PAGE = 0;

const RANKING_ROW = v.object({
  ...RankingEntry.entries,
  total: v.number(),
  shownPage: v.number(),
});

const PAGE_OF_PLACE = `(place - 1) / ${String(RANKING_PAGE_SIZE)} + 1`;

const RANKING_QUERY =
  "WITH ranked AS (SELECT ROW_NUMBER() OVER (ORDER BY ratings.rating DESC, " +
  "ratings.ranked_games DESC, players.name_key, players.id) AS place, players.id AS playerId, " +
  "players.name AS username, ratings.rating AS rating, ratings.ranked_games AS rankedGames, " +
  "COUNT(*) OVER () AS total FROM ratings JOIN players ON players.id = ratings.player_id " +
  "WHERE players.kind = 'registered' AND ratings.ranked_games > 0), " +
  `shown AS (SELECT MIN(MAX(COALESCE(NULLIF(?, ${String(VIEWERS_PAGE)}), ` +
  `(SELECT ${PAGE_OF_PLACE} FROM ranked WHERE playerId = ?), 1), 1), ` +
  `(MAX(total) + ${String(RANKING_PAGE_SIZE - 1)}) / ${String(RANKING_PAGE_SIZE)}) AS shownPage FROM ranked) ` +
  "SELECT ranked.*, shown.shownPage AS shownPage FROM ranked, shown " +
  `WHERE ${PAGE_OF_PLACE} = shown.shownPage OR ranked.playerId = ? ORDER BY place`;

export async function readRankingRows(
  db: RecordReadDatabase,
  page: RankingPage,
  viewer: PlayerId | null,
): Promise<RankingRows> {
  const viewerId = viewer ?? "";
  const { results } = await db
    .prepare(RANKING_QUERY)
    .bind(page === "mine" ? VIEWERS_PAGE : page, viewerId, viewerId)
    .all();
  const rows = results.map((row) => v.parse(RANKING_ROW, row));
  const first = rows[0];
  return {
    page: first?.shownPage ?? 1,
    total: first?.total ?? 0,
    rows: rows.map(({ place, playerId, username, rating, rankedGames }) => ({
      place,
      playerId,
      username,
      rating,
      rankedGames,
    })),
  };
}
