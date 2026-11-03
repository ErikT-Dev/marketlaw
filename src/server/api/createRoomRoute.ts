import { CreateRoomRequest } from "../../shared/api/CreateRoomRequest";
import { createRoomDecision } from "../room/createRoomDecision";
import { roomSizeOf } from "../room/roomSizeOf";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { withFreeRoomCode } from "../withFreeRoomCode";
import { lobbyOf } from "../lobbyOf";
import { bodyOf } from "./bodyOf";
import { identityOf } from "./identityOf";
import { roomJson } from "./roomJson";

export async function createRoomRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, CreateRoomRequest);
  if (body === null) {
    return roomJson({ isOk: false, reason: "malformed_message", rejoinAt: null }, 400);
  }
  const identity = await identityOf(body.token, env);
  if (identity === null) {
    return roomJson({ isOk: false, reason: "invalid_token", rejoinAt: null }, 401);
  }
  const size = roomSizeOf(body.size);
  const isHuman = size !== null && (await verifyHumanCheck(env, request, body.humanCheck));
  const problem = createRoomDecision(body.size, isHuman);
  if (problem !== null || size === null) {
    return roomJson({ isOk: false, reason: problem ?? "invalid_room_size", rejoinAt: null }, 400);
  }
  const lobby = lobbyOf(env);
  if (await lobby.isBusy(identity.playerId)) {
    return roomJson({ isOk: false, reason: "busy_elsewhere", rejoinAt: null }, 409);
  }
  const code = await withFreeRoomCode(env, async (room, candidate) => {
    if (!(await lobby.claim(identity.playerId, candidate))) {
      return false;
    }
    const isCreated = await room.createRoom(
      { code: candidate, size, isPublic: body.isPublic },
      identity,
    );
    if (!isCreated) {
      await lobby.release(identity.playerId, candidate);
    }
    return isCreated;
  });
  return code === null
    ? roomJson({ isOk: false, reason: "no_free_room_code", rejoinAt: null }, 503)
    : roomJson({ isOk: true, code });
}
