import type { CardStats } from "../../shared/catalogue/CardStats";

export type SectorStatEffects = {
  readonly gives: ReadonlyArray<keyof CardStats>;
  readonly usesUp: ReadonlyArray<keyof CardStats>;
};
