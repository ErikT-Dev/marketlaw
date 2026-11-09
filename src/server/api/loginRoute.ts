import type { GuestResponse } from "../../shared/api/GuestResponse";
import { LoginRequest } from "../../shared/api/LoginRequest";
import { decideLogin } from "../accounts/decideLogin";
import { NO_FAILED_LOGINS } from "../accounts/NO_FAILED_LOGINS";
import { unknownLoginKeyOf } from "../accounts/unknownLoginKeyOf";
import { verifyPassword } from "../accounts/verifyPassword";
import { findLoginAccount } from "../findLoginAccount";
import { findUnknownLoginFailures } from "../findUnknownLoginFailures";
import { insertLogin } from "../insertLogin";
import { recordFailedLogin } from "../recordFailedLogin";
import { recordUnknownLoginFailure } from "../recordUnknownLoginFailure";
import { sha256Hex } from "../sha256Hex";
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
  const account = await findLoginAccount(env.DB, body.login);
  const unknownKeyHash = await sha256Hex(unknownLoginKeyOf(body.login));
  const decision = await decideLogin(account, {
    now,
    unknownAccountFailedLogins:
      account === null ? await findUnknownLoginFailures(env.DB, unknownKeyHash) : NO_FAILED_LOGINS,
    isHuman: () => verifyHumanCheck(env, request, body.humanCheck ?? ""),
    isPasswordRight: (account) => verifyPassword(body.password, account?.passwordHash ?? null),
  });
  switch (decision.kind) {
    case "human_check_failed":
      return json({ isOk: false, reason: "human_check_failed" }, 400);
    case "unknown_account":
      await recordUnknownLoginFailure(env.DB, unknownKeyHash, {
        failedLogins: decision.failedLogins,
        now,
      });
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
