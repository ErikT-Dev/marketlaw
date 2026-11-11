import type { Notice } from "../../../shared/Notice";
import type { IconText } from "../../components/IconText";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { resumedNoticeText } from "./resumedNoticeText";
import { SITE_GAME_LIMIT_TOAST } from "./SITE_GAME_LIMIT_TOAST";
import { timeOutText } from "./timeOutText";

export function noticeToastOf(
  notice: Notice,
  viewer: SeatNumber,
  playerNames: ReadonlyArray<string>,
): { readonly title: string; readonly text: IconText } {
  if (notice.kind === "timed_out") {
    return { title: "Your time ran out", text: timeOutText(notice) };
  }
  if (notice.kind === "site_game_limit") {
    return SITE_GAME_LIMIT_TOAST;
  }
  if (notice.kind === "daily_limit") {
    return { title: "No rematch", text: REJECTION_MESSAGES[notice.reason] };
  }
  return { title: "Game resumed", text: resumedNoticeText(notice.seats, viewer, playerNames) };
}
