import { JoinRoomRequest } from "../../shared/api/JoinRoomRequest";
import type { RoomCode } from "../../shared/RoomCode";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";
import { roomJson } from "./roomJson";

export async function joinRoomRoute(request: Request, env: Env, code: RoomCode) {
  const body = await bodyOf(request, JoinRoomRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  if (identity === null) {
    return roomJson({ isOk: false, reason: "invalid_token", rejoinAt: null }, 401);
  }
  const room = env.ROOM.get(env.ROOM.idFromName(code));
  const rejection = await room.joinRoom(identity);
  return rejection === null
    ? roomJson({ isOk: true, code })
    : roomJson({ isOk: false, reason: rejection.reason, rejoinAt: rejection.rejoinAt }, 409);
}
