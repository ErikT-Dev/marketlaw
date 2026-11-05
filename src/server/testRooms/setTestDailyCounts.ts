import * as v from "valibot";
import { TestDailyCountsRequest } from "../../shared/api/TestDailyCountsRequest";
import { identityOf } from "../api/identityOf";
import { lobbyOf } from "../lobbyOf";
import { nowMs } from "../nowMs";
import { hasTestRoomSecret } from "./hasTestRoomSecret";

export async function setTestDailyCounts(request: Request, env: Env): Promise<Response> {
  if (!(await hasTestRoomSecret(request, env))) {
    return new Response("Not found", { status: 404 });
  }
  const body = v.safeParse(TestDailyCountsRequest, await request.json().catch(() => null));
  if (!body.success) {
    return new Response("Bad request", { status: 400 });
  }
  const { token, actions, gameStarts } = body.output;
  const identity = await identityOf(token, env);
  if (identity === null) {
    return new Response("Not found", { status: 404 });
  }
  await lobbyOf(env).setCountsForTest(
    { playerId: identity.playerId, actions, gameStarts },
    nowMs(),
  );
  return new Response(null, { status: 204 });
}
