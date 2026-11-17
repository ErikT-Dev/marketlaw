import type { RankingEntry } from "../../shared/api/RankingEntry";
import type { RankingPage } from "../../shared/api/RankingPage";
import type { RankingResponse } from "../../shared/api/RankingResponse";
import type { RankingStanding } from "../../shared/api/RankingStanding";
import type { RecordReadDatabase } from "../records/RecordReadDatabase";
import { RANKING_PAGE_SIZE } from "./RANKING_PAGE_SIZE";
import type { RankingViewer } from "./RankingViewer";
import { readRankingRows } from "./readRankingRows";

function standingOf(viewer: RankingViewer, rows: ReadonlyArray<RankingEntry>): RankingStanding {
  if (viewer.kind !== "registered") {
    return { kind: viewer.kind };
  }
  const own = rows.find(({ playerId }) => playerId === viewer.playerId);
  return own === undefined ? { kind: "no_ranked_game" } : { kind: "placed", place: own.place };
}

export async function rankingOf(
  db: RecordReadDatabase,
  viewer: RankingViewer,
  page: RankingPage,
): Promise<RankingResponse> {
  const ranking = await readRankingRows(
    db,
    page,
    viewer.kind === "registered" ? viewer.playerId : null,
  );
  const firstPlace = (ranking.page - 1) * RANKING_PAGE_SIZE + 1;
  return {
    page: ranking.page,
    pageCount: Math.max(1, Math.ceil(ranking.total / RANKING_PAGE_SIZE)),
    entries: ranking.rows.filter(
      ({ place }) => place >= firstPlace && place < firstPlace + RANKING_PAGE_SIZE,
    ),
    standing: standingOf(viewer, ranking.rows),
  };
}
