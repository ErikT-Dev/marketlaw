import { joinParsed } from "./joinParsed";
import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookParsed } from "./RulebookParsed";
import { parseRulebookInline } from "./parseRulebookInline";
import { isRulebookListStart } from "./isRulebookListStart";
import { parseRulebookList } from "./parseRulebookList";
import { parseRulebookTable } from "./parseRulebookTable";
import { statWordParts } from "./statWordParts";

const FENCE = "```";
const NOT_A_PARAGRAPH_LINE = /^(?:#|\||\s|- |1\. |```)/;

type Blocks = RulebookParsed<ReadonlyArray<RulebookBlock>>;

function chunksOf(lines: ReadonlyArray<string>): ReadonlyArray<ReadonlyArray<string>> {
  return lines
    .reduce<ReadonlyArray<ReadonlyArray<string>>>(
      (chunks, line) =>
        line.trim() === ""
          ? [...chunks, []]
          : [...chunks.slice(0, -1), [...(chunks.at(-1) ?? []), line]],
      [[]],
    )
    .filter((chunk) => chunk.length > 0);
}

function parsePreformatted(lines: ReadonlyArray<string>): RulebookParsed<RulebookBlock> {
  const isClosed = lines.length >= 2 && lines.at(-1) === FENCE && lines[0] === FENCE;
  return {
    value: { kind: "preformatted", lines: lines.slice(1, -1).map(statWordParts) },
    problems: isClosed ? [] : [`unknown preformatted block at "${lines[0] ?? ""}"`],
  };
}

function parseParagraph(lines: ReadonlyArray<string>): RulebookParsed<RulebookBlock> {
  const inline = parseRulebookInline(lines.join(" "));
  const unknownLines = lines.filter((line) => NOT_A_PARAGRAPH_LINE.test(line));
  return {
    value: { kind: "paragraph", parts: inline.value },
    problems: [...unknownLines.map((line) => `unknown line "${line}"`), ...inline.problems],
  };
}

function parseChunk(lines: ReadonlyArray<string>): RulebookParsed<RulebookBlock> {
  const first = lines[0] ?? "";
  if (first.startsWith(FENCE)) {
    return parsePreformatted(lines);
  }
  if (first.startsWith("|")) {
    return parseRulebookTable(lines);
  }
  return isRulebookListStart(first) ? parseRulebookList(lines) : parseParagraph(lines);
}

export function parseRulebookBlocks(lines: ReadonlyArray<string>): Blocks {
  return joinParsed(
    chunksOf(lines)
      .map(parseChunk)
      .map(({ value, problems }) => ({ value: [value], problems })),
  );
}
