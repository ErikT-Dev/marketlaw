import type { MatchNotStartedReason } from "../../../shared/protocol/MatchNotStartedReason";
import type { IconText } from "../../components/IconText";
import { clockText } from "../../components/clockText";
import type { LobbyQueueNotice } from "../../store/LobbyQueueNotice";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { SITE_GAME_LIMIT_TOAST } from "../game/SITE_GAME_LIMIT_TOAST";

const NOT_STARTED_TEXTS: Readonly<Record<MatchNotStartedReason, string>> = {
  not_confirmed:
    "The match did not start because a player did not confirm. You are back at the front of the queue.",
  player_daily_limit:
    "The match did not start because a player has reached a daily limit. You are back at the front of the queue.",
  no_room: "No room could be made for the match. Join the ranked queue again.",
};

export function queueNoticeToastOf(
  notice: LobbyQueueNotice,
  now: number,
): { readonly title: string; readonly text: IconText } {
  switch (notice.kind) {
    case "match_not_started":
      return { title: "The match did not start", text: NOT_STARTED_TEXTS[notice.reason] };
    case "match_missed":
      return {
        title: "You left the ranked queue",
        text: `You did not confirm the match and left the queue. You can join it again in ${clockText(notice.rejoinAt - now)}.`,
      };
    case "site_game_limit":
      return SITE_GAME_LIMIT_TOAST;
    case "daily_limit":
      return { title: "Daily limit reached", text: REJECTION_MESSAGES[notice.reason] };
  }
}
