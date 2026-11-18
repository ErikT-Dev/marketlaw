import type { Result } from "../Result";
import type { RuleFileProblem } from "./RuleFileProblem";

export function contentsOfRuleFile<T>(
  fileName: string,
  read: Result<ReadonlyArray<T>, ReadonlyArray<RuleFileProblem>>,
): ReadonlyArray<T> {
  if (!read.isOk) {
    const problems = read.error.map(
      ({ line, word, message }) => `${fileName} line ${String(line)}: ${message} (${word})`,
    );
    throw new Error(problems.join("\n"));
  }
  return read.value;
}
