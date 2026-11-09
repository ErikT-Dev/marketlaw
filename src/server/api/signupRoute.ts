import type { GuestResponse } from "../../shared/api/GuestResponse";
import { SignupRequest } from "../../shared/api/SignupRequest";
import { hashPassword } from "../accounts/hashPassword";
import { nameKeyOf } from "../accounts/nameKeyOf";
import { signupProblem } from "../accounts/signupProblem";
import { findLogoutAccount } from "../findLogoutAccount";
import { insertRegisteredUser } from "../insertRegisteredUser";
import type { LogoutAccount } from "../LogoutAccount";
import { registerGuest } from "../registerGuest";
import { sha256Hex } from "../sha256Hex";
import { unclaimedEmailOf } from "../unclaimedEmailOf";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";
import { takenNameKeys } from "./takenNameKeys";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

async function guestOf(env: Env, token: string | undefined): Promise<LogoutAccount | null> {
  const account =
    token === undefined ? null : await findLogoutAccount(env.DB, await sha256Hex(token));
  return account?.isGuest === true ? account : null;
}

async function signedUp(env: Env, body: SignupRequest, guest: LogoutAccount | null, name: string) {
  const account = {
    name,
    passwordHash: await hashPassword(body.password),
    email: await unclaimedEmailOf(env.DB, body.email),
    now: Date.now(),
  };
  if (guest === null || body.token === undefined) {
    return insertRegisteredUser(env.DB, account);
  }
  const { playerId } = guest.identity;
  const isRegistered = await registerGuest(env.DB, playerId, account);
  return isRegistered ? { token: body.token, identity: { playerId, name } } : null;
}

export async function signupRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SignupRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const guest = await guestOf(env, body.token);
  if (body.token !== undefined && guest === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const name = body.username ?? guest?.identity.name ?? "";
  const ownKey = guest === null ? null : nameKeyOf(guest.identity.name);
  const problem = await signupProblem(
    { name, email: body.email, password: body.password },
    {
      isHuman: () => verifyHumanCheck(env, request, body.humanCheck),
      isTaken: async (wanted) =>
        nameKeyOf(wanted) !== ownKey && (await takenNameKeys(env.DB, [wanted])).length > 0,
    },
  );
  if (problem !== null) {
    return json({ isOk: false, reason: problem }, 400);
  }
  const account = await signedUp(env, body, guest, name);
  return account === null
    ? json({ isOk: false, reason: "username_taken" }, 409)
    : json({ isOk: true, token: account.token, playerId: account.identity.playerId, name }, 200);
}
