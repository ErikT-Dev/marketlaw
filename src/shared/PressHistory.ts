import type { RecentPress } from "./RecentPress";

export type PressHistory = {
  readonly protocolVersion: number;
  readonly recentPresses: ReadonlyArray<RecentPress>;
};
