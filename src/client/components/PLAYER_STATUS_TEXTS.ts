import type { PlayerStatus } from "./PlayerStatus";

export const PLAYER_STATUS_TEXTS: Readonly<Record<PlayerStatus, string>> = {
  online: "online",
  inGame: "in a game",
  away: "away",
  done: "done",
  outOfTime: "out of time",
  left: "left",
  none: "",
};
