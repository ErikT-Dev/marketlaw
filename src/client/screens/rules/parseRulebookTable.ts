import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookInline } from "./RulebookInline";
import type { RulebookParsed } from "./RulebookParsed";
import { parseRulebookInline } from "./parseRulebookInline";

const TABLE_ROW = /^\|.*\|$/;
const SEPARATOR_ROW = /^\|(?:\s*:?-+:?\s*\|)+$/;

type Row = ReadonlyArray<ReadonlyArray<RulebookInline>>;

function cellTextsOf(line: string): ReadonlyArray<string> {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function rowProblems(lines: ReadonlyArray<string>, width: number): ReadonlyArray<string> {
  return lines.flatMap((line, index) => {
    if (!TABLE_ROW.test(line)) {
      return [`unknown table line "${line}"`];
    }
    if ((index === 1) !== SEPARATOR_ROW.test(line)) {
      return [`table separator expected only as the second line, at "${line}"`];
    }
    return cellTextsOf(line).length === width ? [] : [`table row "${line}" has the wrong width`];
  });
}

export function parseRulebookTable(lines: ReadonlyArray<string>): RulebookParsed<RulebookBlock> {
  const [headerLine = "", , ...rowLines] = lines;
  const parsedRows = [headerLine, ...rowLines].map((line) =>
    cellTextsOf(line).map(parseRulebookInline),
  );
  const rows: ReadonlyArray<Row> = parsedRows.map((cells) => cells.map(({ value }) => value));
  return {
    value: { kind: "table", header: rows[0] ?? [], rows: rows.slice(1) },
    problems: [
      ...rowProblems(lines, cellTextsOf(headerLine).length),
      ...parsedRows.flat().flatMap(({ problems }) => problems),
    ],
  };
}
