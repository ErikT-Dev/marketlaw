import { SessionRequest } from "../../shared/api/SessionRequest";
import type { SessionResponse } from "../../shared/api/SessionResponse";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";

export async function sessionRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  const reply: SessionResponse =
    identity === null
      ? { isLoggedIn: false }
      : { isLoggedIn: true, playerId: identity.playerId, name: identity.name };
  return Response.json(reply);
}
