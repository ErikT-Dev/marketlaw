import type { EpochMs } from "../EpochMs";

export type ChatPlayerLine = {
  readonly kind: "player_line";
  readonly event: "joined_room" | "left_room" | "left_game";
  readonly name: string;
  readonly at: EpochMs;
};
