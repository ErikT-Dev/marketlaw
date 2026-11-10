import type { EmailResponse } from "../../shared/api/EmailResponse";
import { SessionRequest } from "../../shared/api/SessionRequest";
import { reserveAccountEmail } from "../email/reserveAccountEmail";
import { sendAccountEmail } from "../email/sendAccountEmail";
import { nowMs } from "../nowMs";
import { unclaimedEmailOf } from "../unclaimedEmailOf";
import { bodyOf } from "./bodyOf";
import { registeredEmailAccountOf } from "./registeredEmailAccountOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function sendAgainRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const now = nowMs();
  const account = await registeredEmailAccountOf(env.DB, body.token, now);
  if (account instanceof Response) {
    return account;
  }
  const to = account.unconfirmedEmail;
  if (to === null) {
    return json({ isOk: true }, 200);
  }
  const { playerId } = account;
  const reservation = await reserveAccountEmail(env, { playerId, address: to, now });
  if (!reservation.isOk) {
    return json({ isOk: false, reason: reservation.reason }, 429);
  }
  const isUnclaimed = (await unclaimedEmailOf(env.DB, to)) !== null;
  const kind = isUnclaimed ? "confirm" : "already_in_use";
  const siteUrl = new URL(request.url).origin;
  const { countedKeys } = reservation;
  await sendAccountEmail(env, { playerId, kind, to, siteUrl, now, countedKeys });
  return json({ isOk: true }, 200);
}
