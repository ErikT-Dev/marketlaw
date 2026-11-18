import { JoinRoomRequest } from "../../shared/api/JoinRoomRequest";
import type { TutorialStartResponse } from "../../shared/api/TutorialStartResponse";
import { TUTORIAL_PLACE } from "../lobby/TUTORIAL_PLACE";
import { lobbyOf } from "../lobbyOf";
import { nowMs } from "../nowMs";
import { tutorialOf } from "../tutorialOf";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";
import { isReallyBusy } from "./isReallyBusy";
import { leaveFinishedRooms } from "./leaveFinishedRooms";

function json(body: TutorialStartResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function startTutorialRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, JoinRoomRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  if (identity === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const { playerId } = identity;
  if (await isReallyBusy(env, playerId, TUTORIAL_PLACE)) {
    return json({ isOk: false, reason: "busy_elsewhere" }, 409);
  }
  const lobby = lobbyOf(env);
  const rejection = await lobby.startTutorial(playerId, nowMs());
  if (rejection !== null) {
    return json({ isOk: false, reason: rejection }, 409);
  }
  await tutorialOf(env, playerId)
    .start(identity)
    .catch(async (error: unknown) => {
      await lobby.release(playerId, TUTORIAL_PLACE);
      throw error;
    });
  await leaveFinishedRooms(env, playerId, TUTORIAL_PLACE);
  return json({ isOk: true }, 200);
}
