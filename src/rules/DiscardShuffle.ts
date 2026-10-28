import type { DrawAsked } from "../shared/DrawAsked";

export type DiscardShuffle = {
  readonly asked: DrawAsked | null;
  readonly count: number;
};
