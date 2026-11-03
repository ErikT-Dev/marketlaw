import type { Notice } from "../../../shared/Notice";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { playerNameOf } from "./playerNameOf";
import { timeOutText } from "./timeOutText";

export function noticeToastOf(
  notice: Notice,
  viewer: SeatNumber,
  playerNames: ReadonlyArray<string>,
): { readonly title: string; readonly text: string } {
  if (notice.kind === "timed_out") {
    return { title: "Your time ran out", text: timeOutText(notice) };
  }
  const seconds = String(Math.round(notice.freeMs / 1000));
  const who =
    notice.seat === viewer
      ? `You get ${seconds} seconds of free time before your time runs out.`
      : `${playerNameOf(playerNames, notice.seat)} gets ${seconds} seconds of free time before their time runs out.`;
  return { title: "Game resumed", text: `Everyone was away, so the game was paused. ${who}` };
}
