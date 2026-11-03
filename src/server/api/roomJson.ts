import type { RoomResponse } from "../../shared/api/RoomResponse";

export function roomJson(body: RoomResponse, status = 200): Response {
  return Response.json(body, { status });
}
