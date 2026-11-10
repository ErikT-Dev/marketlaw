import type { GuestResponse } from "../../shared/api/GuestResponse";
import { NewPasswordRequest } from "../../shared/api/NewPasswordRequest";
import { hashPassword } from "../accounts/hashPassword";
import { passwordProblem } from "../accounts/passwordProblem";
import { resetLinkAccountOf } from "../email/resetLinkAccountOf";
import { setPasswordWithLink } from "../email/setPasswordWithLink";
import { nowMs } from "../nowMs";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function newPasswordRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, NewPasswordRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const problem = passwordProblem(body.password);
  if (problem !== null) {
    return json({ isOk: false, reason: problem }, 400);
  }
  const link = { tokenHash: await sha256Hex(body.link), now: nowMs() };
  const identity = await resetLinkAccountOf(env.DB, link);
  if (identity === null) {
    return json({ isOk: false, reason: "link_expired" }, 400);
  }
  const { playerId, name } = identity;
  const passwordHash = await hashPassword(body.password);
  const token = await setPasswordWithLink(env.DB, { ...link, playerId, passwordHash });
  return token === null
    ? json({ isOk: false, reason: "link_expired" }, 400)
    : json({ isOk: true, token, playerId, name }, 200);
}
