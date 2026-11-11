import * as v from "valibot";
import { HistoryCursor } from "../../shared/api/HistoryCursor";
import type { MatchHistoryResponse } from "../../shared/api/MatchHistoryResponse";
import { PlayerId } from "../../shared/PlayerId";
import { matchHistoryOf } from "../records/matchHistoryOf";
import { readUsernames } from "../records/readUsernames";

const ACCOUNT_GONE: MatchHistoryResponse = { kind: "account_gone" };

function cursorOf(params: URLSearchParams): HistoryCursor | null | "bad" {
  const endedAt = params.get("before_ms");
  const gameId = params.get("before_game");
  if (endedAt === null && gameId === null) {
    return null;
  }
  if (endedAt === null || endedAt === "" || gameId === null || gameId === "") {
    return "bad";
  }
  const cursor = v.safeParse(HistoryCursor, { endedAt: Number(endedAt), gameId });
  return cursor.success ? cursor.output : "bad";
}

export async function matchHistoryRoute(
  request: Request,
  env: Env,
  playerIdText: string,
): Promise<Response> {
  const playerId = v.safeParse(PlayerId, playerIdText);
  const before = cursorOf(new URL(request.url).searchParams);
  if (before === "bad") {
    return new Response("Bad request", { status: 400 });
  }
  if (!playerId.success) {
    return Response.json(ACCOUNT_GONE, { status: 404 });
  }
  const history = await matchHistoryOf(
    env.DB,
    async (ids) => readUsernames(env.DB, ids),
    playerId.output,
    before,
  );
  return Response.json(history, { status: history.kind === "found" ? 200 : 404 });
}
