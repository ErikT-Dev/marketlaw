import * as v from "valibot";
import { RoomCode } from "../shared/RoomCode";
import { createGuestRoute } from "./api/createGuestRoute";
import { createRoomRoute } from "./api/createRoomRoute";
import { generatedNameRoute } from "./api/generatedNameRoute";
import { humanCheckRoute } from "./api/humanCheckRoute";
import { joinRoomRoute } from "./api/joinRoomRoute";
import { roomJson } from "./api/roomJson";
import { sessionRoute } from "./api/sessionRoute";
import { lobbyOf } from "./lobbyOf";
import { removeOldReplayRecords } from "./replays/removeOldReplayRecords";
import { confirmTestSeat } from "./testRooms/confirmTestSeat";
import { createTestRoom } from "./testRooms/createTestRoom";
import { restartTestRoom } from "./testRooms/restartTestRoom";

export { GameRoom } from "./GameRoom";
export { Lobby } from "./Lobby";

const ROOM_PATH = /^\/api\/rooms\/([A-Z0-9]{6})\/(join|socket)$/;

async function routeRoom(request: Request, env: Env, path: RegExpExecArray): Promise<Response> {
  const code = v.safeParse(RoomCode, path[1]);
  if (!code.success) {
    return roomJson({ isOk: false, reason: "room_not_found", rejoinAt: null }, 404);
  }
  if (path[2] === "socket") {
    return env.ROOM.get(env.ROOM.idFromName(code.output)).fetch(request);
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  return joinRoomRoute(request, env, code.output);
}

const POST_ROUTES: Readonly<Record<string, (request: Request, env: Env) => Promise<Response>>> = {
  "/api/guests": createGuestRoute,
  "/api/rooms": createRoomRoute,
  "/api/session": sessionRoute,
  "/api/test-rooms": createTestRoom,
  "/api/test-room-seats": confirmTestSeat,
  "/api/test-room-restarts": restartTestRoom,
};

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  const roomPath = ROOM_PATH.exec(pathname);
  if (roomPath !== null) {
    return routeRoom(request, env, roomPath);
  }
  if (pathname === "/api/lobby/socket") {
    return lobbyOf(env).fetch(request);
  }
  if (request.method === "GET" && pathname === "/api/generated-name") {
    return generatedNameRoute(env);
  }
  if (request.method === "GET" && pathname === "/api/human-check") {
    return humanCheckRoute(env);
  }
  const postRoute = request.method === "POST" ? POST_ROUTES[pathname] : undefined;
  return postRoute === undefined
    ? new Response("Not found", { status: 404 })
    : postRoute(request, env);
}

export default {
  fetch: route,
  async scheduled(controller, env) {
    await removeOldReplayRecords(env.DB, controller.scheduledTime);
  },
} satisfies ExportedHandler<Env>;
