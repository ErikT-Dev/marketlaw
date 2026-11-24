import type { ChangeLimit } from "./ChangeLimit";

export function changesWithUnder(
  limit: ChangeLimit,
  changesMs: ReadonlyArray<number>,
  now: number,
): ReadonlyArray<number> {
  const recent = changesMs.filter((changedMs) => changedMs > now - limit.waitMs);
  return [...recent.slice(-(limit.count - 1)), now];
}
