import type { Result } from "../Result";
import type { RuleFileProblem } from "./RuleFileProblem";
import { wholeNumberOf } from "./wholeNumberOf";

const COUNTED = /^(\S+) (.+)$/;

export function amountOf(
  part: string,
  line: number,
): Result<{ readonly count: number; readonly words: string }, RuleFileProblem> {
  const match = COUNTED.exec(part);
  const count = wholeNumberOf(match?.[1] ?? "");
  if (match === null || count === null) {
    return {
      isOk: false,
      error: { line, word: match?.[1] ?? part, message: "needs a whole number from 1 to 99" },
    };
  }
  return { isOk: true, value: { count, words: match[2] ?? "" } };
}
