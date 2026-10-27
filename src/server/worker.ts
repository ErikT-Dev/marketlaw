import * as v from "valibot";
import { CreateRoomRequest } from "../shared/api/CreateRoomRequest";
import { GuestRequest } from "../shared/api/GuestRequest";
import { JoinRoomRequest } from "../shared/api/JoinRoomRequest";
import type { GuestResponse } from "../shared/api/GuestResponse";
import type { RoomResponse } from "../shared/api/RoomResponse";
import { PlayerId } from "../shared/PlayerId";
import { RoomCode } from "../shared/RoomCode";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import { newRoomCode } from "./newRoomCode";
import { newSessionToken } from "./newSessionToken";
import type { Identity } from "./room/Identity";
import { sha256Hex } from "./sha256Hex";

export { GameRoom } from "./GameRoom";

const ROOM_PATH = /^\/api\/rooms\/([A-Z0-9]{6})\/(join|socket)$/;
const CODE_ATTEMPTS = 5;

function json(body: GuestResponse | RoomResponse, status = 200): Response {
  return Response.json(body, { status });
}

async function bodyOf<T extends v.GenericSchema>(
  request: Request,
  schema: T,
): Promise<v.InferOutput<T> | null> {
  const parsed = v.safeParse(schema, await request.json().catch(() => null));
  return parsed.success ? parsed.output : null;
}

async function identityOf(token: string, env: Env): Promise<Identity | null> {
  return findPlayerByTokenHash(env.DB, await sha256Hex(token));
}

async function createGuest(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, GuestRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const token = newSessionToken();
  const playerId = v.parse(PlayerId, crypto.randomUUID());
  await env.DB.prepare("INSERT INTO players (id, name, token_hash, created_ms) VALUES (?, ?, ?, ?)")
    .bind(playerId, body.name, await sha256Hex(token), Date.now())
    .run();
  return json({ token, playerId, name: body.name });
}

async function createRoom(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, CreateRoomRequest);
  if (body === null) {
    return json({ isOk: false, reason: "invalid_room_size" }, 400);
  }
  const identity = await identityOf(body.token, env);
  if (identity === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = newRoomCode();
    const room = env.ROOM.get(env.ROOM.idFromName(code));
    if (await room.createRoom(code, body.size, identity)) {
      return json({ isOk: true, code });
    }
  }
  return json({ isOk: false, reason: "room_not_found" }, 503);
}

async function routeRoom(request: Request, env: Env, path: RegExpExecArray): Promise<Response> {
  const code = v.safeParse(RoomCode, path[1]);
  if (!code.success) {
    return json({ isOk: false, reason: "room_not_found" }, 404);
  }
  const room = env.ROOM.get(env.ROOM.idFromName(code.output));
  if (path[2] === "socket") {
    return room.fetch(request);
  }
  const body = await bodyOf(request, JoinRoomRequest);
  const identity = body === null ? null : await identityOf(body.token, env);
  if (identity === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const reason = await room.joinRoom(identity);
  return reason === null
    ? json({ isOk: true, code: code.output })
    : json({ isOk: false, reason }, 409);
}

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  const roomPath = ROOM_PATH.exec(pathname);
  if (roomPath !== null) {
    return routeRoom(request, env, roomPath);
  }
  if (request.method === "POST" && pathname === "/api/guests") {
    return createGuest(request, env);
  }
  if (request.method === "POST" && pathname === "/api/rooms") {
    return createRoom(request, env);
  }
  return new Response("Not found", { status: 404 });
}

export default {
  fetch: route,
} satisfies ExportedHandler<Env>;
