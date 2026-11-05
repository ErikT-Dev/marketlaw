import { clockText } from "../../components/clockText";
import type { RemovalNotice } from "../../store/RemovalNotice";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";

export function removalText(removal: RemovalNotice, now: number): string {
  const wait =
    removal.rejoinAt === null || removal.rejoinAt <= now
      ? "You can join that room again now."
      : `You can join that room again in ${clockText(removal.rejoinAt - now)}.`;
  switch (removal.reason) {
    case "declined":
      return `You declined the game. ${wait}`;
    case "timed_out":
      return `You did not accept the game in time. ${wait}`;
    case "disconnected":
      return "Your connection to the room was lost for 10 seconds, so your place was given up.";
    case "daily_action_limit":
    case "daily_game_start_limit":
      return REJECTION_MESSAGES[removal.reason];
  }
}
