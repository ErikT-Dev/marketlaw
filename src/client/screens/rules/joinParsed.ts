import type { RulebookParsed } from "./RulebookParsed";

export function joinParsed<T>(
  parsedParts: ReadonlyArray<RulebookParsed<ReadonlyArray<T>>>,
): RulebookParsed<ReadonlyArray<T>> {
  return {
    value: parsedParts.flatMap(({ value }) => value),
    problems: parsedParts.flatMap(({ problems }) => problems),
  };
}
