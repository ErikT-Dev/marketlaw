import type { GuestResponse } from "../../shared/api/GuestResponse";
import { LoginRequest } from "../../shared/api/LoginRequest";
import { decideLogin } from "../accounts/decideLogin";
import { verifyPassword } from "../accounts/verifyPassword";
import { findLoginAccount } from "../findLoginAccount";
import { insertLogin } from "../insertLogin";
import { recordFailedLogin } from "../recordFailedLogin";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function loginRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, LoginRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const now = Date.now();
  const decision = await decideLogin(await findLoginAccount(env.DB, body.login), {
    now,
    isHuman: () => verifyHumanCheck(env, request, body.humanCheck ?? ""),
    isPasswordRight: (account) => verifyPassword(body.password, account?.passwordHash ?? null),
  });
  switch (decision.kind) {
    case "human_check_failed":
      return json({ isOk: false, reason: "human_check_failed" }, 400);
    case "unknown_account":
      return json({ isOk: false, reason: "login_failed" }, 400);
    case "wrong_password":
      await recordFailedLogin(env.DB, decision.account.identity.playerId, decision.failedLogins);
      return json({ isOk: false, reason: "login_failed" }, 400);
    case "logged_in": {
      const { identity } = decision.account;
      const token = await insertLogin(env.DB, identity.playerId, {
        now,
        isClearingFailedLogins: decision.hadFailedLogins,
      });
      return json({ isOk: true, token, playerId: identity.playerId, name: identity.name }, 200);
    }
  }
}
