import type { Notice } from "../../../shared/Notice";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { playerNameOf } from "./playerNameOf";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { timeOutText } from "./timeOutText";

export function noticeToastOf(
  notice: Notice,
  viewer: SeatNumber,
  playerNames: ReadonlyArray<string>,
): { readonly title: string; readonly text: string } {
  if (notice.kind === "timed_out") {
    return { title: "Your time ran out", text: timeOutText(notice) };
  }
  if (notice.kind === "site_game_limit") {
    return { title: "The game did not start", text: REJECTION_MESSAGES.site_game_limit };
  }
  const seconds = String(Math.round(notice.freeMs / 1000));
  const others = notice.seats
    .filter((seat) => seat !== viewer)
    .map((seat) => playerNameOf(playerNames, seat));
  const parts = [
    ...(notice.seats.includes(viewer)
      ? [`You get ${seconds} seconds of free time before your time runs out.`]
      : []),
    ...(others.length === 0
      ? []
      : [
          `${others.join(" and ")} ${others.length === 1 ? "gets" : "get"} ${seconds} seconds of free time before their time runs out.`,
        ]),
  ];
  const who = parts.join(" ");
  return { title: "Game resumed", text: `Everyone was away, so the game was paused. ${who}` };
}
