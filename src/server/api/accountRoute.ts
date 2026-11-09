import * as v from "valibot";
import type { AccountResponse } from "../../shared/api/AccountResponse";
import { SessionRequest } from "../../shared/api/SessionRequest";
import { UsernameWait } from "../../shared/api/UsernameWait";
import { usernameChangeAllowedAt } from "../accounts/usernameChangeAllowedAt";
import { findRenameAccount } from "../findRenameAccount";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

const LOGGED_OUT: AccountResponse = { isLoggedIn: false };

function usernameWaitOf(changedMs: number | null, now: number): UsernameWait | null {
  const allowedAt = usernameChangeAllowedAt(changedMs, now);
  return changedMs === null || allowedAt === null
    ? null
    : v.parse(UsernameWait, { changedAt: changedMs, allowedAt });
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
    usernameWait: usernameWaitOf(account.usernameChangedMs, now),
  };
  return Response.json(reply);
}
