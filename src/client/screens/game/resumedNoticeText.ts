import type { SeatFreeTime } from "../../../shared/SeatFreeTime";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { playerNameOf } from "./playerNameOf";

function secondsOf(freeMs: number): string {
  return String(Math.round(freeMs / 1000));
}

export function resumedNoticeText(
  seats: ReadonlyArray<SeatFreeTime>,
  viewer: SeatNumber,
  playerNames: ReadonlyArray<string>,
): string {
  const own = seats.find(({ seat }) => seat === viewer);
  const others = seats.filter(({ seat }) => seat !== viewer);
  const freeTimes = [...new Set(others.map(({ freeMs }) => freeMs))];
  const parts = [
    ...(own === undefined
      ? []
      : [`You get ${secondsOf(own.freeMs)} seconds of free time before your time runs out.`]),
    ...freeTimes.map((freeMs) => {
      const names = others
        .filter((other) => other.freeMs === freeMs)
        .map(({ seat }) => playerNameOf(playerNames, seat));
      return `${names.join(" and ")} ${names.length === 1 ? "gets" : "get"} ${secondsOf(freeMs)} seconds of free time before their time runs out.`;
    }),
  ];
  return `Everyone was away, so the game was paused. ${parts.join(" ")}`;
}
