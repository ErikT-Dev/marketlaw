import * as v from "valibot";
import type { RankingPage } from "../../shared/api/RankingPage";
import type { RankingRequest } from "../../shared/api/RankingRequest";
import { RankingResponse } from "../../shared/api/RankingResponse";
import { postJson } from "./postJson";

export async function requestRanking(
  token: string | null,
  page: RankingPage,
): Promise<RankingResponse | null> {
  const request: RankingRequest = { token, page };
  const parsed = v.safeParse(
    RankingResponse,
    await postJson("/api/ranking", request).catch(() => null),
  );
  return parsed.success ? parsed.output : null;
}
