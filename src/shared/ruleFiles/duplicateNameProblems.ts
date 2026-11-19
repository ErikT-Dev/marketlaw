import type { RuleFileEntry } from "./RuleFileEntry";
import type { RuleFileProblem } from "./RuleFileProblem";

export function duplicateNameProblems<T>(
  entries: ReadonlyArray<RuleFileEntry<T>>,
  nameOf: (value: T) => string,
): ReadonlyArray<RuleFileProblem> {
  return entries.flatMap(({ line, value }) => {
    const name = nameOf(value);
    const first = entries.find((entry) => nameOf(entry.value).toLowerCase() === name.toLowerCase());
    return first === undefined || first.line === line
      ? []
      : [{ line, word: name, message: `the name is already used on line ${first.line}` }];
  });
}
