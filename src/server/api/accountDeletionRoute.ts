import { AccountDeletionRequest } from "../../shared/api/AccountDeletionRequest";
import type { EmailResponse } from "../../shared/api/EmailResponse";
import { verifyPassword } from "../accounts/verifyPassword";
import { deleteAccountRows } from "../deletion/deleteAccountRows";
import { findDeletingAccount } from "../deletion/findDeletingAccount";
import { logOutOfRooms } from "../logOutOfRooms";
import { nowMs } from "../nowMs";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function accountDeletionRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, AccountDeletionRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const tokenHash = await sha256Hex(body.token);
  const account = await findDeletingAccount(env.DB, tokenHash, nowMs());
  if (account === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  if (account.isGuest) {
    return json({ isOk: false, reason: "not_registered" }, 400);
  }
  if (!(await verifyPassword(body.password, account.passwordHash))) {
    return json({ isOk: false, reason: "password_wrong" }, 400);
  }
  const hasLeftRooms = await logOutOfRooms(env, {
    sender: { identity: account.identity, tokenHash },
    token: body.token,
    isLeaving: true,
    isEndingEveryLogin: true,
  });
  if (!hasLeftRooms) {
    return new Response("Could not delete the account, try again", { status: 503 });
  }
  await deleteAccountRows(env.DB, account.identity.playerId);
  return json({ isOk: true }, 200);
}
