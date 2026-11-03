import * as v from "valibot";
import { RoomCode } from "../../shared/RoomCode";
import { hasTestRoomSecret } from "./hasTestRoomSecret";

const RESTART_REQUEST = v.object({ code: RoomCode });

export async function restartTestRoom(request: Request, env: Env): Promise<Response> {
  if (!(await hasTestRoomSecret(request, env))) {
    return new Response("Not found", { status: 404 });
  }
  const body = v.safeParse(RESTART_REQUEST, await request.json().catch(() => null));
  if (!body.success) {
    return new Response("Bad request", { status: 400 });
  }
  await env.ROOM.get(env.ROOM.idFromName(body.output.code))
    .restartForTest()
    .catch(() => undefined);
  return new Response(null, { status: 204 });
}
