import * as v from "valibot";
import { EpochMs } from "../shared/EpochMs";
import { RoomCode } from "../shared/RoomCode";
import { accountDeletionRoute } from "./api/accountDeletionRoute";
import { accountRoute } from "./api/accountRoute";
import { confirmEmailRoute } from "./api/confirmEmailRoute";
import { createGuestRoute } from "./api/createGuestRoute";
import { createRoomRoute } from "./api/createRoomRoute";
import { emailChangeRoute } from "./api/emailChangeRoute";
import { generatedNameRoute } from "./api/generatedNameRoute";
import { humanCheckRoute } from "./api/humanCheckRoute";
import { joinRoomRoute } from "./api/joinRoomRoute";
import { loginRoute } from "./api/loginRoute";
import { logoutRoute } from "./api/logoutRoute";
import { newPasswordRoute } from "./api/newPasswordRoute";
import { privacyContactRoute } from "./api/privacyContactRoute";
import { rankingRoute } from "./api/rankingRoute";
import { recordRoute } from "./api/recordRoute";
import { replayExportRoute } from "./api/replayExportRoute";
import { resetEmailRoute } from "./api/resetEmailRoute";
import { roomJson } from "./api/roomJson";
import { sessionRoute } from "./api/sessionRoute";
import { sendAgainRoute } from "./api/sendAgainRoute";
import { signupRoute } from "./api/signupRoute";
import { usernameChangeRoute } from "./api/usernameChangeRoute";
import { removeUnusedGuests } from "./deletion/removeUnusedGuests";
import { removeOldEmailRecords } from "./email/removeOldEmailRecords";
import { lobbyOf } from "./lobbyOf";
import { queueOf } from "./queueOf";
import { removeForgottenLoginFailures } from "./removeForgottenLoginFailures";
import { removeOldReplayRecords } from "./replays/removeOldReplayRecords";
import { confirmTestSeat } from "./testRooms/confirmTestSeat";
import { createTestRoom } from "./testRooms/createTestRoom";
import { readTestOutbox } from "./testRooms/readTestOutbox";
import { restartTestRoom } from "./testRooms/restartTestRoom";
import { setTestDailyCounts } from "./testRooms/setTestDailyCounts";

export { GameRoom } from "./GameRoom";
export { Lobby } from "./Lobby";
export { RankedQueue } from "./RankedQueue";

const ROOM_PATH = /^\/api\/rooms\/([A-Z0-9]{6})\/(join|socket|replay)$/;

async function routeRoom(request: Request, env: Env, path: RegExpExecArray): Promise<Response> {
  const code = v.safeParse(RoomCode, path[1]);
  if (!code.success) {
    return roomJson({ isOk: false, reason: "room_not_found", rejoinAt: null }, 404);
  }
  if (path[2] === "socket") {
    return env.ROOM.get(env.ROOM.idFromName(code.output)).fetch(request);
  }
  if (path[2] === "replay") {
    return request.method === "GET"
      ? replayExportRoute(request, env, code.output)
      : new Response("Method not allowed", { status: 405 });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  return joinRoomRoute(request, env, code.output);
}

const POST_ROUTES: Readonly<Record<string, (request: Request, env: Env) => Promise<Response>>> = {
  "/api/account": accountRoute,
  "/api/account-deletions": accountDeletionRoute,
  "/api/guests": createGuestRoute,
  "/api/logins": loginRoute,
  "/api/logout": logoutRoute,
  "/api/ranking": rankingRoute,
  "/api/rooms": createRoomRoute,
  "/api/signups": signupRoute,
  "/api/confirmation-emails": sendAgainRoute,
  "/api/email-confirmations": confirmEmailRoute,
  "/api/email-changes": emailChangeRoute,
  "/api/reset-emails": resetEmailRoute,
  "/api/password-resets": newPasswordRoute,
  "/api/username-changes": usernameChangeRoute,
  "/api/session": sessionRoute,
  "/api/test-rooms": createTestRoom,
  "/api/test-room-seats": confirmTestSeat,
  "/api/test-room-restarts": restartTestRoom,
  "/api/test-daily-counts": setTestDailyCounts,
  "/api/test-outbox": readTestOutbox,
};

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  const roomPath = ROOM_PATH.exec(pathname);
  if (roomPath !== null) {
    return routeRoom(request, env, roomPath);
  }
  const recordAnswer = recordRoute(request, env, pathname);
  if (recordAnswer !== null) {
    return recordAnswer;
  }
  if (pathname === "/api/lobby/socket") {
    return lobbyOf(env).fetch(request);
  }
  if (pathname === "/api/queue/socket") {
    return queueOf(env).fetch(request);
  }
  if (request.method === "GET" && pathname === "/api/generated-name") {
    return generatedNameRoute(env);
  }
  if (request.method === "GET" && pathname === "/api/human-check") {
    return humanCheckRoute(env);
  }
  if (request.method === "GET" && pathname === "/api/privacy-contact") {
    return privacyContactRoute(env);
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
    await removeForgottenLoginFailures(env.DB, controller.scheduledTime);
    const now = v.parse(EpochMs, controller.scheduledTime);
    await removeOldEmailRecords(env.DB, now);
    await removeUnusedGuests(env.DB, now);
  },
} satisfies ExportedHandler<Env>;
