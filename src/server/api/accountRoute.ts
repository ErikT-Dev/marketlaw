import * as v from "valibot";
import type { AccountResponse } from "../../shared/api/AccountResponse";
import { SessionRequest } from "../../shared/api/SessionRequest";
import { UsernameWait } from "../../shared/api/UsernameWait";
import { usernameChangeAllowedAt } from "../accounts/usernameChangeAllowedAt";
import { accountEmailDetailsOf } from "../email/accountEmailDetailsOf";
import { findRenameAccount } from "../findRenameAccount";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

const LOGGED_OUT: AccountResponse = { isLoggedIn: false };

function usernameWaitOf(changesMs: ReadonlyArray<number>, now: number): UsernameWait | null {
  const allowedAt = usernameChangeAllowedAt(changesMs, now);
  return allowedAt === null ? null : v.parse(UsernameWait, { allowedAt });
}

export async function accountRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  if (body === null) {
    return Response.json(LOGGED_OUT, { status: 400 });
  }
  const now = Date.now();
  const account = await findRenameAccount(env.DB, await sha256Hex(body.token), now);
  if (account === null) {
    return Response.json(LOGGED_OUT);
  }
  const reply: AccountResponse = {
    isLoggedIn: true,
    name: account.identity.name,
    usernameWait: usernameWaitOf(account.usernameChangesMs, now),
    email: await accountEmailDetailsOf(env.DB, account.identity.playerId),
  };
  return Response.json(reply);
}
