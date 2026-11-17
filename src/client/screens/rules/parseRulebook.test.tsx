import { describe, expect, it } from "vitest";
import rulebookText from "../../../../harness/spec/rulebook.md?raw";
import { parseRulebook } from "./parseRulebook";
import type { Rulebook } from "./Rulebook";
import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookSection } from "./RulebookSection";

function parsedRulebook(): Rulebook {
  const result = parseRulebook(rulebookText);
  if (!result.isOk) {
    throw new Error(result.error.join("\n"));
  }
  return result.value;
}

function sectionTitled(title: string): RulebookSection {
  const section = parsedRulebook().sections.find((candidate) => candidate.title === title);
  if (section === undefined) {
    throw new Error(`no section ${title}`);
  }
  return section;
}

function blockOfKind<K extends RulebookBlock["kind"]>(
  section: RulebookSection,
  kind: K,
): Extract<RulebookBlock, { kind: K }> {
  const block = section.blocks.find(
    (candidate): candidate is Extract<RulebookBlock, { kind: K }> => candidate.kind === kind,
  );
  if (block === undefined) {
    throw new Error(`no ${kind} in ${section.title}`);
  }
  return block;
}

function problemsOf(text: string): ReadonlyArray<string> {
  const result = parseRulebook(text);
  return result.isOk ? [] : result.error;
}

const SMALL_RULEBOOK = "# Title\n\n## Contents\n\n1. [Only](#only)\n\n## Only\n\n";

describe("parseRulebook", () => {
  it("parses the whole rulebook without any syntax it does not know", () => {
    expect(parseRulebook(rulebookText)).toMatchObject({ isOk: true });
  });

  it("reads the title, the 21 contents entries and one section per entry", () => {
    const rulebook = parsedRulebook();
    expect(rulebook.title).toBe("How to play MarketLaw");
    expect(rulebook.contents).toHaveLength(21);
    expect(rulebook.sections.map(({ anchor }) => anchor)).toEqual(
      rulebook.contents.map(({ anchor }) => anchor),
    );
    expect(rulebook.contents[0]).toEqual({ title: "The goal", anchor: "the-goal" });
  });

  it("shows stat words as stat icons and keeps section titles as words", () => {
    const table = blockOfKind(sectionTitled("Your stats"), "table");
    expect(table.rows[0]?.[0]).toEqual([{ stat: "funds" }]);
    expect(table.rows[8]?.[0]).toEqual([{ stat: "bonus" }]);
    expect(sectionTitled("Income").title).toBe("Income");
  });

  it("shows types written as inline code as type icons", () => {
    const list = blockOfKind(sectionTitled("The cards"), "list");
    expect(list.items[4]).toContainEqual({ type: "Farm" });
    expect(list.items[4]).toContainEqual({ type: "Low Wealth" });
  });

  it("keeps the words bonus types apart from the bonus stat", () => {
    const paragraphParts = sectionTitled("The end of the game").blocks.flatMap((block) =>
      block.kind === "paragraph" ? block.parts : [],
    );
    expect(paragraphParts).toContainEqual({ kind: "bold", parts: ["Bonus types:"] });
  });

  it("shows the stats of the score formula as icons", () => {
    const formula = blockOfKind(sectionTitled("The end of the game"), "preformatted");
    expect(formula.lines[2]).toEqual(["+ 6.5  × ", { stat: "income" }]);
  });

  it("relates a section to the sections it links to in order of first appearance", () => {
    expect(sectionTitled("The goal").related).toEqual([
      { title: "The end of the game", anchor: "the-end-of-the-game" },
    ]);
    expect(sectionTitled("The main phase").related.map(({ anchor }) => anchor)).toEqual([
      "playing-a-card",
      "types-and-combos",
      "influence",
      "projects",
      "quests",
      "undo",
    ]);
  });

  it("reports inline syntax it does not know", () => {
    expect(problemsOf(`${SMALL_RULEBOOK}Some _odd_ text.\n`)).toEqual([
      'unknown inline syntax in "Some _odd_ text."',
    ]);
  });

  it("reports inline code that names no type", () => {
    expect(problemsOf(`${SMALL_RULEBOOK}A \`Castle\` type.\n`)).toEqual([
      'inline code "Castle" names no type',
    ]);
  });

  it("reports headings below section level and unclosed preformatted blocks", () => {
    expect(problemsOf(`${SMALL_RULEBOOK}### Deeper\n\n\`\`\`\nopen\n`)).toEqual([
      'unknown line "### Deeper"',
      'unknown preformatted block at "```"',
    ]);
  });

  it("reports a rulebook without a title or contents", () => {
    expect(problemsOf("Just text.\n")).toEqual([
      "the rulebook does not start with a title",
      "the rulebook has no contents",
    ]);
  });
});
