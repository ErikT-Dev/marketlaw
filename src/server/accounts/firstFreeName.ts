import { nameKeyOf } from "./nameKeyOf";

export function firstFreeName(
  candidates: ReadonlyArray<string>,
  takenKeys: ReadonlyArray<string>,
): string | null {
  return candidates.find((name) => !takenKeys.includes(nameKeyOf(name))) ?? null;
}
