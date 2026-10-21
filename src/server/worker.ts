export { CounterRoom } from "./CounterRoom";

const ROOM_PATH = "/api/room";
const SHARED_ROOM_NAME = "counter";

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== ROOM_PATH) {
      return new Response("Not found", { status: 404 });
    }
    const room = env.ROOM.get(env.ROOM.idFromName(SHARED_ROOM_NAME));
    return room.fetch(request);
  },
} satisfies ExportedHandler<Env>;
