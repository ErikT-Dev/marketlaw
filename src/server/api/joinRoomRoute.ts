import { JoinRoomRequest } from "../../shared/api/JoinRoomRequest";
import type { RoomCode } from "../../shared/RoomCode";
import { lobbyOf } from "../lobbyOf";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";
import { isReallyBusy } from "./isReallyBusy";
import { leaveFinishedRooms } from "./leaveFinishedRooms";
import { roomJson } from "./roomJson";

const BUSY = { isOk: false, reason: "busy_elsewhere", rejoinAt: null } as const;

export async function joinRoomRoute(request: Request, env: Env, code: RoomCode) {
  const body = await bodyOf(request, JoinRoomRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  if (identity === null) {
    return roomJson({ isOk: false, reason: "invalid_token", rejoinAt: null }, 401);
  }
  if (await isReallyBusy(env, identity.playerId, code)) {
    return roomJson(BUSY, 409);
  }
  const lobby = lobbyOf(env);
  const room = env.ROOM.get(env.ROOM.idFromName(code));
  const expected = await room.joinRejection(identity);
  if (expected !== null) {
    if (expected.reason === "room_not_found") {
      await lobby.roomChanged(code, null);
    }
    return roomJson({ isOk: false, ...expected }, 409);
  }
  if (!(await lobby.claim(identity.playerId, code))) {
    return roomJson(BUSY, 409);
  }
  const rejection = await room.joinRoom(identity).catch(async (error: unknown) => {
    await lobby.release(identity.playerId, code);
    throw error;
  });
  if (rejection !== null) {
    await lobby.release(identity.playerId, code);
    return roomJson({ isOk: false, ...rejection }, 409);
  }
  await leaveFinishedRooms(env, identity.playerId, code);
  return roomJson({ isOk: true, code });
}
