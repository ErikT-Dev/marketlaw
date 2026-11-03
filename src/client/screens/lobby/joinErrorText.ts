import { clockText } from "../../components/clockText";
import type { JoinError } from "../../store/JoinError";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";

export function joinErrorText(error: JoinError, now: number): string {
  if (error.reason === "room_not_found") {
    return `No room has the code ${error.code}. Check the code and try again.`;
  }
  if (error.reason === "room_full") {
    return "This room is full.";
  }
  if (error.reason === "room_not_waiting") {
    return "The game in this room has already started.";
  }
  if (error.reason === "rejoin_too_soon") {
    return `You can join this room again in ${clockText((error.rejoinAt ?? now) - now)}.`;
  }
  return REJECTION_MESSAGES[error.reason];
}
