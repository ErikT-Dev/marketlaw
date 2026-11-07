import type { EpochMs } from "../EpochMs";

export type ChatGameLine = {
  readonly kind: "game_line";
  readonly event: "game_started" | "game_ended";
  readonly at: EpochMs;
};
