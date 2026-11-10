import type { EmailResponse } from "../../shared/api/EmailResponse";
import { EmailChangeRequest } from "../../shared/api/EmailChangeRequest";
import { emailKeyOf } from "../accounts/emailKeyOf";
import { emailProblem } from "../accounts/emailProblem";
import { dropPendingEmail } from "../email/dropPendingEmail";
import { reserveAccountEmail } from "../email/reserveAccountEmail";
import { savePendingEmail } from "../email/savePendingEmail";
import { sendAccountEmail } from "../email/sendAccountEmail";
import { nowMs } from "../nowMs";
import { unclaimedEmailOf } from "../unclaimedEmailOf";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";
import { registeredEmailAccountOf } from "./registeredEmailAccountOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function emailChangeRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, EmailChangeRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const now = nowMs();
  const account = await registeredEmailAccountOf(env.DB, body.token, now);
  if (account instanceof Response) {
    return account;
  }
  const problem = emailProblem(body.email);
  if (problem !== null) {
    return json({ isOk: false, reason: problem }, 400);
  }
  if (!(await verifyHumanCheck(env, request, body.humanCheck))) {
    return json({ isOk: false, reason: "human_check_failed" }, 400);
  }
  const { playerId, confirmedEmail } = account;
  if (confirmedEmail !== null && emailKeyOf(confirmedEmail) === emailKeyOf(body.email)) {
    await dropPendingEmail(env.DB, playerId);
    return json({ isOk: true }, 200);
  }
  const reservation = await reserveAccountEmail(env, { playerId, address: body.email, now });
  if (!reservation.isOk) {
    return json({ isOk: false, reason: reservation.reason }, 429);
  }
  await savePendingEmail(env.DB, { playerId, email: body.email });
  const isUnclaimed = (await unclaimedEmailOf(env.DB, body.email)) !== null;
  const kind = isUnclaimed ? "change_confirm" : "already_in_use";
  const siteUrl = new URL(request.url).origin;
  await sendAccountEmail(env, {
    playerId,
    kind,
    to: body.email,
    siteUrl,
    now,
    countedKeys: reservation.countedKeys,
  });
  return json({ isOk: true }, 200);
}
