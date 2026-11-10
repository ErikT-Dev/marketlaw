import type { EmailResponse } from "../../shared/api/EmailResponse";
import { ResetEmailRequest } from "../../shared/api/ResetEmailRequest";
import { confirmedAccountOf } from "../email/confirmedAccountOf";
import { reserveAccountEmail } from "../email/reserveAccountEmail";
import { sendAccountEmail } from "../email/sendAccountEmail";
import { nowMs } from "../nowMs";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function resetEmailRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, ResetEmailRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  if (!(await verifyHumanCheck(env, request, body.humanCheck))) {
    return json({ isOk: false, reason: "human_check_failed" }, 400);
  }
  const account = await confirmedAccountOf(env.DB, body.email);
  if (account === null) {
    return json({ isOk: false, reason: "email_not_confirmed" }, 400);
  }
  const now = nowMs();
  const { playerId, email: to } = account;
  const overLimit = await reserveAccountEmail(env, { playerId, address: to, now });
  if (overLimit !== null) {
    return json({ isOk: false, reason: overLimit }, 429);
  }
  const siteUrl = new URL(request.url).origin;
  await sendAccountEmail(env, { playerId, kind: "reset", to, siteUrl, now });
  return json({ isOk: true }, 200);
}
