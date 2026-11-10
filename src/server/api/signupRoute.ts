import type { GuestResponse } from "../../shared/api/GuestResponse";
import { SignupRequest } from "../../shared/api/SignupRequest";
import { hashPassword } from "../accounts/hashPassword";
import { loginStateOf } from "../accounts/loginStateOf";
import { nameKeyOf } from "../accounts/nameKeyOf";
import { signupProblem } from "../accounts/signupProblem";
import { findLogoutAccount } from "../findLogoutAccount";
import { insertRegisteredUser } from "../insertRegisteredUser";
import type { LogoutAccount } from "../LogoutAccount";
import { registerGuest } from "../registerGuest";
import { sha256Hex } from "../sha256Hex";
import { unclaimedEmailOf } from "../unclaimedEmailOf";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { reserveAccountEmail } from "../email/reserveAccountEmail";
import { sendAccountEmail } from "../email/sendAccountEmail";
import { returnAccountEmail } from "../email/returnAccountEmail";
import { nowMs } from "../nowMs";
import type { EpochMs } from "../../shared/EpochMs";
import { bodyOf } from "./bodyOf";
import { takenNameKeys } from "./takenNameKeys";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

async function guestOf(
  env: Env,
  token: string | undefined,
  now: number,
): Promise<LogoutAccount | null> {
  const account =
    token === undefined ? null : await findLogoutAccount(env.DB, await sha256Hex(token));
  return account?.isGuest === true && loginStateOf(account.lastUsedMs, now) !== "expired"
    ? account
    : null;
}

type Signup = {
  readonly body: SignupRequest;
  readonly guest: LogoutAccount | null;
  readonly name: string;
  readonly now: EpochMs;
};

async function signedUp(env: Env, signup: Signup) {
  const { body, guest, name, now } = signup;
  const passwordHash = await hashPassword(body.password);
  const account = { name, passwordHash, email: body.email, now };
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
  const guest = await guestOf(env, body.token, Date.now());
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
  return signUpAndSendEmail(request, env, { body, guest, name, now: nowMs() });
}

async function signUpAndSendEmail(request: Request, env: Env, signup: Signup): Promise<Response> {
  const { body, guest, name, now } = signup;
  const reservation = await reserveAccountEmail(env, {
    playerId: guest?.identity.playerId ?? null,
    address: body.email,
    now,
  });
  if (!reservation.isOk) {
    return json({ isOk: false, reason: reservation.reason }, 429);
  }
  const isUnclaimed = (await unclaimedEmailOf(env.DB, body.email)) !== null;
  const account = await signedUp(env, signup);
  if (account === null) {
    await returnAccountEmail(env, reservation.countedKeys, now);
    return json({ isOk: false, reason: "username_taken" }, 409);
  }
  const { playerId } = account.identity;
  await sendAccountEmail(env, {
    playerId,
    kind: isUnclaimed ? "confirm" : "already_in_use",
    to: body.email,
    siteUrl: new URL(request.url).origin,
    now,
    countedKeys: reservation.countedKeys,
  });
  return json({ isOk: true, token: account.token, playerId, name }, 200);
}
