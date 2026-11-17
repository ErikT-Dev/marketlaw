import type { RankingResponse } from "../../../shared/api/RankingResponse";

export function rankingPagerText(ranking: RankingResponse): string | null {
  const first = ranking.entries.at(0);
  const last = ranking.entries.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  return `Page ${ranking.page} of ${ranking.pageCount} · places ${first.place}–${last.place}`;
}
