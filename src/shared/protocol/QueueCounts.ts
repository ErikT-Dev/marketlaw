import type { RankedGameSize } from "../RankedGameSize";

export type QueueCounts = {
  readonly total: number;
  readonly bySize: Readonly<Record<RankedGameSize, number>>;
};
