import type { Result } from "../../../shared/Result";
import { headingAnchor } from "./headingAnchor";
import { linkAnchorsIn } from "./linkAnchorsIn";
import { parseRulebookBlocks } from "./parseRulebookBlocks";
import type { Rulebook } from "./Rulebook";
import type { RulebookParsed } from "./RulebookParsed";
import type { RulebookSection } from "./RulebookSection";
import type { RulebookSectionRef } from "./RulebookSectionRef";

const TITLE = /^# (.+)$/;
const SECTION_HEADING = /^## (.+)$/;
const CONTENTS_TITLE = "Contents";
const CONTENTS_ENTRY = /^\d+\. \[([^\]]+)\]\(#([^)]+)\)$/;

type RawSection = {
  readonly title: string;
  readonly lines: ReadonlyArray<string>;
};

function rawSectionsOf(lines: ReadonlyArray<string>): ReadonlyArray<RawSection> {
  return lines.reduce<ReadonlyArray<RawSection>>((sections, line) => {
    const heading = SECTION_HEADING.exec(line)?.[1];
    if (heading !== undefined) {
      return [...sections, { title: heading.trim(), lines: [] }];
    }
    const last = sections.at(-1);
    return last === undefined
      ? sections
      : [...sections.slice(0, -1), { ...last, lines: [...last.lines, line] }];
  }, []);
}

function parseContents(lines: ReadonlyArray<string>): RulebookParsed<ReadonlyArray<RulebookSectionRef>> {
  const entryLines = lines.filter((line) => line.trim() !== "");
  const entries = entryLines.map((line) => CONTENTS_ENTRY.exec(line));
  return {
    value: entries.flatMap((entry) =>
      entry?.[1] === undefined || entry[2] === undefined ? [] : [{ title: entry[1], anchor: entry[2] }],
    ),
    problems: entryLines
      .filter((line) => !CONTENTS_ENTRY.test(line))
      .map((line) => `unknown contents line "${line}"`),
  };
}

function withRelated(
  sections: ReadonlyArray<Omit<RulebookSection, "related">>,
): ReadonlyArray<RulebookSection> {
  return sections.map((section) => ({
    ...section,
    related: [...new Set(linkAnchorsIn(section.blocks))]
      .filter((anchor) => anchor !== section.anchor)
      .flatMap((anchor) => sections.filter((other) => other.anchor === anchor))
      .map(({ title, anchor }) => ({ title, anchor })),
  }));
}

export function parseRulebook(text: string): Result<Rulebook, ReadonlyArray<string>> {
  const lines = text.split(/\r?\n/);
  const title = TITLE.exec(lines[0] ?? "")?.[1];
  const firstSection = lines.findIndex((line) => SECTION_HEADING.test(line));
  const introduction = parseRulebookBlocks(lines.slice(1, firstSection < 0 ? lines.length : firstSection));
  const rawSections = rawSectionsOf(lines);
  const contents = parseContents(
    rawSections.find((section) => section.title === CONTENTS_TITLE)?.lines ?? [],
  );
  const bodies = rawSections
    .filter((section) => section.title !== CONTENTS_TITLE)
    .map((section) => ({ section, blocks: parseRulebookBlocks(section.lines) }));
  const problems = [
    ...(title === undefined ? ["the rulebook does not start with a title"] : []),
    ...(contents.value.length === 0 ? ["the rulebook has no contents"] : []),
    ...introduction.problems,
    ...contents.problems,
    ...bodies.flatMap(({ blocks }) => blocks.problems),
  ];
  if (title === undefined || problems.length > 0) {
    return { isOk: false, error: problems };
  }
  const sections = withRelated(
    bodies.map(({ section, blocks }) => ({
      title: section.title,
      anchor: headingAnchor(section.title),
      blocks: blocks.value,
    })),
  );
  return {
    isOk: true,
    value: { title, introduction: introduction.value, contents: contents.value, sections },
  };
}
