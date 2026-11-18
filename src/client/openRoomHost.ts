import type { GameHost } from "../shared/GameHost";
import type { RoomCode } from "../shared/RoomCode";
import { openSocketHost } from "./openSocketHost";

export function openRoomHost(code: RoomCode, token: string): GameHost {
  return openSocketHost(`/api/rooms/${code}/socket`, token);
}
