import { SessionRequest } from "../../shared/api/SessionRequest";
import type { SessionResponse } from "../../shared/api/SessionResponse";
import { findSessionAccount } from "../findSessionAccount";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

export async function sessionRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  const account =
    body === null ? null : await findSessionAccount(env.DB, await sha256Hex(body.token));
  const reply: SessionResponse =
    account === null
      ? { isLoggedIn: false }
      : {
          isLoggedIn: true,
          playerId: account.identity.playerId,
          name: account.identity.name,
          isGuest: account.isGuest,
        };
  return Response.json(reply);
}
