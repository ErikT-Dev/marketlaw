import type { PlayerId } from "../../shared/PlayerId";

export type ChatReader = {
  readonly playerId: PlayerId;
  readonly messageFrom: number;
  readonly lineFrom: number;
};
