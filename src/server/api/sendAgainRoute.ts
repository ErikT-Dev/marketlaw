import type { EmailResponse } from "../../shared/api/EmailResponse";
import { SessionRequest } from "../../shared/api/SessionRequest";
import { findEmailAccount } from "../email/findEmailAccount";
import { reserveAccountEmail } from "../email/reserveAccountEmail";
import { sendAccountEmail } from "../email/sendAccountEmail";
import { nowMs } from "../nowMs";
import { sha256Hex } from "../sha256Hex";
import { unclaimedEmailOf } from "../unclaimedEmailOf";
import { bodyOf } from "./bodyOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function sendAgainRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const now = nowMs();
  const account = await findEmailAccount(env.DB, await sha256Hex(body.token), now);
  if (account === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  if (account.isGuest) {
    return json({ isOk: false, reason: "not_registered" }, 400);
  }
  const to = account.unconfirmedEmail;
  if (to === null) {
    return json({ isOk: true }, 200);
  }
  const { playerId } = account;
  const overLimit = await reserveAccountEmail(env, { playerId, address: to, now });
  if (overLimit !== null) {
    return json({ isOk: false, reason: overLimit }, 429);
  }
  const isUnclaimed = (await unclaimedEmailOf(env.DB, to)) !== null;
  const kind = isUnclaimed ? "confirm" : "already_in_use";
  await sendAccountEmail(env, { playerId, kind, to, siteUrl: new URL(request.url).origin, now });
  return json({ isOk: true }, 200);
}
