import type { RoomCode } from "../../shared/RoomCode";
import { keptReplayRecord } from "../replays/keptReplayRecord";
import { hasTestRoomSecret } from "../testRooms/hasTestRoomSecret";

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function replayExportRoute(
  request: Request,
  env: Env,
  code: RoomCode,
): Promise<Response> {
  if (!(await hasTestRoomSecret(request, env))) {
    return notFound();
  }
  const fromRoom = await env.ROOM.get(env.ROOM.idFromName(code)).replayRecord();
  if (fromRoom !== null) {
    return Response.json(fromRoom);
  }
  const stored = await keptReplayRecord(env.DB, code, Date.now());
  return stored === null ? notFound() : Response.json(stored);
}
