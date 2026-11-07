import type { GameAction } from "./GameAction";

export type SystemAction = Extract<
  GameAction,
  { readonly type: "time_out" | "pause_game" | "resume_game" | "abandon_game" | "close_vote" }
>;
