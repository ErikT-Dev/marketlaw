import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";

export function rejectionOfReply(reply: ServerMessage): ReasonCode | null {
  if (reply.type === "rejected") {
    return reply.code;
  }
  if (
    reply.type === "removed" &&
    (reply.reason === "daily_action_limit" || reply.reason === "daily_game_start_limit")
  ) {
    return reply.reason;
  }
  return null;
}
