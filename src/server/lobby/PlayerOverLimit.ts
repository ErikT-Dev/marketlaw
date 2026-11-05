import type { PlayerId } from "../../shared/PlayerId";

export type PlayerOverLimit = {
  readonly playerId: PlayerId;
  readonly reason: "daily_action_limit" | "daily_game_start_limit";
};
