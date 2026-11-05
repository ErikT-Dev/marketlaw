import type { PlayerId } from "../../shared/PlayerId";

export type PlayedActions = {
  readonly playerId: PlayerId;
  readonly actions: number;
};
