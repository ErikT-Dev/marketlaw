import type { PlayerId } from "../../shared/PlayerId";

export function otherTabsOf<T>(
  tabs: ReadonlyArray<{ readonly tab: T; readonly playerId: PlayerId | null }>,
  playerId: PlayerId,
  current: T,
): ReadonlyArray<T> {
  return tabs
    .filter((entry) => entry.tab !== current && entry.playerId === playerId)
    .map(({ tab }) => tab);
}
