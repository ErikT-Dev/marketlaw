import type { PlayerView } from "../PlayerView";

export type GameUpdate = {
  readonly stateVersion: number;
  readonly view: PlayerView;
};
