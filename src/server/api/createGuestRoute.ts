import { GuestRequest } from "../../shared/api/GuestRequest";
import type { GuestResponse } from "../../shared/api/GuestResponse";
import { guestNameDecision } from "../accounts/guestNameDecision";
import { usernameProblem } from "../accounts/usernameProblem";
import { insertGuest } from "../insertGuest";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";
import { takenNameKeys } from "./takenNameKeys";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function createGuestRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, GuestRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const isNameValid = usernameProblem(body.name) === null;
  const isTaken = isNameValid && (await takenNameKeys(env.DB, [body.name])).length > 0;
  const isHuman =
    isNameValid && !isTaken && (await verifyHumanCheck(env, request, body.humanCheck));
  const problem = guestNameDecision(body.name, { isTaken, isHuman });
  if (problem !== null) {
    return json({ isOk: false, reason: problem }, 400);
  }
  const guest = await insertGuest(env, body.name);
  return guest === null
    ? json({ isOk: false, reason: "username_taken" }, 409)
    : json(
        { isOk: true, token: guest.token, playerId: guest.identity.playerId, name: body.name },
        200,
      );
}
