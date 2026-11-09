import type { SeatNumber } from "../../../shared/SeatNumber";
import type { IconText } from "../../components/IconText";
import type { ClientState } from "../../store/ClientState";
import { noticeToastOf } from "../game/noticeToastOf";
import { SITE_GAME_LIMIT_TOAST } from "../game/SITE_GAME_LIMIT_TOAST";
import { waitingRoomNoticesOf } from "./waitingRoomNoticesOf";

export function afterGameNoticesOf(
  state: ClientState,
  viewer: SeatNumber,
  playerNames: ReadonlyArray<string>,
): {
  readonly rejection: IconText | null;
  readonly toast: { readonly title: string; readonly text: IconText } | null;
} {
  const { rejection, hasSiteGameLimitNotice } = waitingRoomNoticesOf(state);
  if (state.timeOutNotice !== null) {
    return { rejection, toast: noticeToastOf(state.timeOutNotice, viewer, playerNames) };
  }
  return { rejection, toast: hasSiteGameLimitNotice ? SITE_GAME_LIMIT_TOAST : null };
}
