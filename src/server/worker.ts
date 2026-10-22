import { readPressHistory } from "./readPressHistory";

export { CounterRoom } from "./CounterRoom";

const ROOM_PATH = "/api/room";
const HISTORY_PATH = "/api/history";
const SHARED_ROOM_NAME = "counter";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === ROOM_PATH) {
      const room = env.ROOM.get(env.ROOM.idFromName(SHARED_ROOM_NAME));
      return room.fetch(request);
    }
    if (url.pathname === HISTORY_PATH && request.method === "GET") {
      return Response.json(await readPressHistory(env.DB));
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
