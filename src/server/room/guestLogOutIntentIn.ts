import type { PlayerId } from "../../shared/PlayerId";
import type { GuestLogOutIntent } from "./GuestLogOutIntent";
import { isPlayerBusyIn } from "./isPlayerBusyIn";
import type { RoomRecord } from "./RoomRecord";

export function guestLogOutIntentIn(
  record: RoomRecord | null,
  playerId: PlayerId,
): GuestLogOutIntent | null {
  if (record === null || !record.players.some((player) => player.playerId === playerId)) {
    return null;
  }
  const seat = record.game?.seats.find((candidate) => candidate.playerId === playerId);
  if (seat !== undefined && isPlayerBusyIn(record, playerId)) {
    return { type: "action", stateVersion: seat.stateVersion, action: { type: "leave_game" } };
  }
  return { type: "room", action: { type: "leave_room" } };
}
