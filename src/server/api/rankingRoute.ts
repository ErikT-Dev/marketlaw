import { RankingRequest } from "../../shared/api/RankingRequest";
import { findSessionAccount } from "../findSessionAccount";
import { rankingOf } from "../ratings/rankingOf";
import type { RankingViewer } from "../ratings/RankingViewer";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

async function viewerOf(token: string | null, env: Env): Promise<RankingViewer> {
  const account = token === null ? null : await findSessionAccount(env.DB, await sha256Hex(token));
  if (account === null) {
    return { kind: "logged_out" };
  }
  return account.isGuest
    ? { kind: "guest" }
    : { kind: "registered", playerId: account.identity.playerId };
}

export async function rankingRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, RankingRequest);
  if (body === null) {
    return new Response("Bad request", { status: 400 });
  }
  return Response.json(await rankingOf(env.DB, await viewerOf(body.token, env), body.page));
}
