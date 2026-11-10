import { SessionRequest } from "../../shared/api/SessionRequest";
import type { SessionResponse } from "../../shared/api/SessionResponse";
import { deleteLogin } from "../deleteLogin";
import { findLogoutAccount } from "../findLogoutAccount";
import { logOutOfRooms } from "../logOutOfRooms";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

const LOGGED_OUT: SessionResponse = { isLoggedIn: false };

export async function logoutRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, SessionRequest);
  if (body === null) {
    return Response.json(LOGGED_OUT, { status: 400 });
  }
  const tokenHash = await sha256Hex(body.token);
  const account = await findLogoutAccount(env.DB, tokenHash);
  if (account === null) {
    return Response.json(LOGGED_OUT);
  }
  const hasLeftRooms = await logOutOfRooms(env, {
    sender: { identity: account.identity, tokenHash },
    token: body.token,
    isLeaving: account.isGuest,
    isEndingEveryLogin: false,
  });
  if (!hasLeftRooms) {
    return new Response("Could not log out, try again", { status: 503 });
  }
  await deleteLogin(env.DB, tokenHash);
  return Response.json(LOGGED_OUT);
}
