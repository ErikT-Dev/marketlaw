import { JoinRoomRequest } from "../../shared/api/JoinRoomRequest";
import type { RoomCode } from "../../shared/RoomCode";
import { lobbyOf } from "../lobbyOf";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";
import { roomJson } from "./roomJson";

export async function joinRoomRoute(request: Request, env: Env, code: RoomCode) {
  const body = await bodyOf(request, JoinRoomRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  if (identity === null) {
    return roomJson({ isOk: false, reason: "invalid_token", rejoinAt: null }, 401);
  }
  const lobby = lobbyOf(env);
  if (!(await lobby.claim(identity.playerId, code))) {
    return roomJson({ isOk: false, reason: "busy_elsewhere", rejoinAt: null }, 409);
  }
  const room = env.ROOM.get(env.ROOM.idFromName(code));
  const rejection = await room.joinRoom(identity);
  if (rejection !== null) {
    await lobby.release(identity.playerId, code);
  }
  return rejection === null
    ? roomJson({ isOk: true, code })
    : roomJson({ isOk: false, reason: rejection.reason, rejoinAt: rejection.rejoinAt }, 409);
}
