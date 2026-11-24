import type { ChangeLimit } from "./ChangeLimit";

export function changeAllowedAtUnder(
  limit: ChangeLimit,
  changesMs: ReadonlyArray<number>,
  now: number,
): number | null {
  const recent = changesMs.filter((changedMs) => changedMs > now - limit.waitMs);
  return recent.length < limit.count
    ? null
    : Math.min(...recent.slice(-limit.count)) + limit.waitMs;
}
