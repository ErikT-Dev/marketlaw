import { gameRecordRoute } from "./gameRecordRoute";
import { matchHistoryRoute } from "./matchHistoryRoute";

const MATCH_HISTORY_PATH = /^\/api\/players\/([^/]+)\/history$/;
const GAME_RECORD_PATH = /^\/api\/records\/([^/]+)$/;

export function recordRoute(
  request: Request,
  env: Env,
  pathname: string,
): Promise<Response> | null {
  const history = MATCH_HISTORY_PATH.exec(pathname);
  const record = GAME_RECORD_PATH.exec(pathname);
  if (history === null && record === null) {
    return null;
  }
  if (request.method !== "GET") {
    return Promise.resolve(new Response("Method not allowed", { status: 405 }));
  }
  return history === null
    ? gameRecordRoute(env, record?.[1] ?? "")
    : matchHistoryRoute(request, env, history[1] ?? "");
}
