import type { GameKind } from "../shared/GameKind";

export type GameSetup = {
  readonly players: 1 | 2 | 3 | 4;
  readonly kind: GameKind;
  readonly startedAt: number;
};
