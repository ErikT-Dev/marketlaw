import { SessionRequest } from "../../shared/api/SessionRequest";
import type { SessionResponse } from "../../shared/api/SessionResponse";
import { deleteLogin } from "../deleteLogin";
import { findLogoutAccount } from "../findLogoutAccount";
import { lobbyOf } from "../lobbyOf";
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
  await deleteLogin(env.DB, tokenHash);
  const { playerId } = account.identity;
  const lobby = lobbyOf(env);
  const busyCode = await lobby.busyRoomOf(playerId);
  const codes = [
    ...(busyCode === null ? [] : [busyCode]),
    ...(await lobby.stayingRoomsOf(playerId)),
  ];
  const login = {
    sender: { identity: account.identity, tokenHash },
    token: body.token,
    isGuest: account.isGuest,
  };
  await Promise.all(
    [...new Set(codes)].map(async (code) =>
      env.ROOM.get(env.ROOM.idFromName(code))
        .logOut(login)
        .catch(() => undefined),
    ),
  );
  return Response.json(LOGGED_OUT);
}
