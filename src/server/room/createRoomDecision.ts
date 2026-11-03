import type { ReasonCode } from "../../shared/ReasonCode";
import { roomSizeOf } from "./roomSizeOf";

export function createRoomDecision(size: number, isHuman: boolean): ReasonCode | null {
  if (roomSizeOf(size) === null) {
    return "invalid_room_size";
  }
  return isHuman ? null : "human_check_failed";
}
