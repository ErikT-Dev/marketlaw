import type { ClientState } from "../../store/ClientState";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";

export function waitingRoomNoticesOf(state: ClientState): {
  readonly rejection: string | null;
  readonly hasSiteGameLimitNotice: boolean;
} {
  const rejectedCode = state.rejectedMove?.code ?? null;
  const isSiteGameLimitRejection = rejectedCode === "site_game_limit";
  return {
    rejection:
      rejectedCode === null || isSiteGameLimitRejection ? null : REJECTION_MESSAGES[rejectedCode],
    hasSiteGameLimitNotice:
      isSiteGameLimitRejection || state.timeOutNotice?.kind === "site_game_limit",
  };
}
