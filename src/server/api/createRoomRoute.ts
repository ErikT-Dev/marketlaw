import { CreateRoomRequest } from "../../shared/api/CreateRoomRequest";
import { createRoomDecision } from "../room/createRoomDecision";
import { roomSizeOf } from "../room/roomSizeOf";
import { verifyHumanCheck } from "../verifyHumanCheck";
import { bodyOf } from "./bodyOf";
import { createInFreeRoom } from "./createInFreeRoom";
import { identityOf } from "./identityOf";
import { isReallyBusy } from "./isReallyBusy";
import { leaveFinishedRooms } from "./leaveFinishedRooms";
import { roomJson } from "./roomJson";

const BUSY = { isOk: false, reason: "busy_elsewhere", rejoinAt: null } as const;

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
  if (await isReallyBusy(env, identity.playerId, null)) {
    return roomJson(BUSY, 409);
  }
  const code = await createInFreeRoom(env, identity, { size, isPublic: body.isPublic });
  if (code === "busy") {
    return roomJson(BUSY, 409);
  }
  if (code === null) {
    return roomJson({ isOk: false, reason: "no_free_room_code", rejoinAt: null }, 503);
  }
  await leaveFinishedRooms(env, identity.playerId, code);
  return roomJson({ isOk: true, code });
}
