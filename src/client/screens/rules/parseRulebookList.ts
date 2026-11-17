import { joinParsed } from "./joinParsed";
import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookParsed } from "./RulebookParsed";
import { parseRulebookInline } from "./parseRulebookInline";

const ORDERED_ITEM = /^\d+\. /;
const UNORDERED_ITEM = /^- /;
const CONTINUATION = /^ {2,}\S/;

type ItemTexts = RulebookParsed<ReadonlyArray<string>>;

function itemTextsOf(lines: ReadonlyArray<string>, itemStart: RegExp): ItemTexts {
  return lines.reduce<ItemTexts>(
    (sofar, line) => {
      if (itemStart.test(line)) {
        return { ...sofar, value: [...sofar.value, line.replace(itemStart, "")] };
      }
      const last = sofar.value.at(-1);
      if (CONTINUATION.test(line) && last !== undefined) {
        return { ...sofar, value: [...sofar.value.slice(0, -1), `${last} ${line.trim()}`] };
      }
      return { ...sofar, problems: [...sofar.problems, `unknown list line "${line}"`] };
    },
    { value: [], problems: [] },
  );
}

export function isRulebookListStart(line: string): boolean {
  return ORDERED_ITEM.test(line) || UNORDERED_ITEM.test(line);
}

export function parseRulebookList(lines: ReadonlyArray<string>): RulebookParsed<RulebookBlock> {
  const isOrdered = ORDERED_ITEM.test(lines[0] ?? "");
  const texts = itemTextsOf(lines, isOrdered ? ORDERED_ITEM : UNORDERED_ITEM);
  const items = texts.value.map(parseRulebookInline);
  return {
    value: { kind: "list", isOrdered, items: items.map(({ value }) => value) },
    problems: [...texts.problems, ...joinParsed(items).problems],
  };
}
