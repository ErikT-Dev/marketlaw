import type { PlayerId } from "../../shared/PlayerId";

export type Identity = {
  readonly playerId: PlayerId;
  readonly name: string;
};
