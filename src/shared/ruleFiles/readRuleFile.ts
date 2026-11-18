import type { Result } from "../Result";
import type { RuleFileEntry } from "./RuleFileEntry";
import type { RuleFileParts } from "./RuleFileParts";
import type { RuleFileProblem } from "./RuleFileProblem";

type LineReader<T> = (
  parts: RuleFileParts,
  line: number,
) => Result<T, ReadonlyArray<RuleFileProblem>>;

const PART_SEPARATOR = " | ";
const FINAL_LINE_BREAK = /\r?\n$/;
const LINE_BREAK = /\r?\n/;

function partsOf(row: string, line: number): Result<RuleFileParts, ReadonlyArray<RuleFileProblem>> {
  if (row.trim() === "") {
    return { isOk: false, error: [{ line, word: row, message: "empty line" }] };
  }
  const parts = row.split(PART_SEPARATOR);
  const [first, second, third, fourth] = parts;
  if (
    parts.length !== 4 ||
    first === undefined ||
    second === undefined ||
    third === undefined ||
    fourth === undefined
  ) {
    return {
      isOk: false,
      error: [{ line, word: row, message: 'the line needs four parts separated by " | "' }],
    };
  }
  return { isOk: true, value: [first, second, third, fourth] };
}

export function readRuleFile<T>(
  text: string,
  readLine: LineReader<T>,
): Result<ReadonlyArray<RuleFileEntry<T>>, ReadonlyArray<RuleFileProblem>> {
  const rows = text.replace(FINAL_LINE_BREAK, "").split(LINE_BREAK);
  const results = rows.map((row, index) => {
    const line = index + 1;
    const parts = partsOf(row, line);
    return { line, result: parts.isOk ? readLine(parts.value, line) : parts };
  });
  const problems = results.flatMap(({ result }) => (result.isOk ? [] : result.error));
  if (problems.length > 0) {
    return { isOk: false, error: problems };
  }
  return {
    isOk: true,
    value: results.flatMap(({ line, result }) =>
      result.isOk ? [{ line, value: result.value }] : [],
    ),
  };
}
