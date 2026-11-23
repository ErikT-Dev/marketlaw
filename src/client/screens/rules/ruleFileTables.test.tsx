import { describe, expect, it } from "vitest";
import { INFLUENCE_ACTIONS } from "../../../shared/ruleFiles/INFLUENCE_ACTIONS";
import { QUEST_LINES } from "../../../shared/ruleFiles/QUEST_LINES";
import { PARSED_RULEBOOK } from "./PARSED_RULEBOOK";
import type { RulebookBlock } from "./RulebookBlock";

type TableBlock = Extract<RulebookBlock, { readonly kind: "table" }>;

function tablesOf(title: string): ReadonlyArray<TableBlock> {
  const section = PARSED_RULEBOOK.sections.find((candidate) => candidate.title === title);
  return (section?.blocks ?? []).filter(
    (block): block is TableBlock => block.kind === "table",
  );
}

function blocksOf(title: string): ReadonlyArray<RulebookBlock> {
  return PARSED_RULEBOOK.sections.find((candidate) => candidate.title === title)?.blocks ?? [];
}

describe("rulebook tables from the rule files", () => {
  it("shows every influence action of the file in one table with its limit", () => {
    const [table] = tablesOf("Influence");
    expect(table?.header).toEqual([["Action"], ["Times per game"]]);
    expect(table?.rows).toHaveLength(INFLUENCE_ACTIONS.length);
    expect(table?.rows[0]).toEqual([
      ["4 ", { stat: "influence" }, " → 2 ", { stat: "funds" }],
      ["1"],
    ]);
    expect(table?.rows[4]).toEqual([["1 ", { stat: "funds" }, " → 1 ", { stat: "influence" }], ["any"]]);
  });

  it("shows the rising build pass price and the draw actions in words", () => {
    const rows = tablesOf("Influence")[0]?.rows ?? [];
    expect(rows[5]?.[0]).toEqual([
      "2 ",
      { stat: "funds" },
      " → 1 ",
      { stat: "buildPasses" },
      " (costs 1 more ",
      { stat: "funds" },
      " each time you buy one)",
    ]);
    expect(rows.at(-1)).toEqual([
      ["5 ", { stat: "influence" }, " → draw a tier 3 card of a kind you choose"],
      ["any"],
    ]);
  });

  it("shows every quest of the file in one table per tier with needs and reward", () => {
    const tables = tablesOf("The quest list");
    expect(tables).toHaveLength(3);
    expect(tables.flatMap(({ rows }) => rows.map((row) => row[0]))).toEqual(
      QUEST_LINES.map(({ name }) => [name]),
    );
    expect(tables[0]?.rows[0]).toEqual([
      ["Working district"],
      ["3 Residential cards and 2 ", { type: "Low Wealth" }],
      ["+1 ", { stat: "influence" }, ", +1 ", { stat: "quality" }],
    ]);
    expect(tables[1]?.rows[6]).toEqual([
      ["Market town"],
      ["2 ", { type: "Town Housing" }, ", 2 ", { type: "Retail" }, " and 1 ", { type: "Food" }],
      ["gain 1 ", { type: "Alcohol" }, ", draw 1 card"],
    ]);
  });

  it("titles each quest table with its tier", () => {
    const titles = blocksOf("The quest list").flatMap((block) =>
      block.kind === "paragraph" ? [block.parts] : [],
    );
    expect(titles).toEqual(
      expect.arrayContaining([
        [{ kind: "bold", parts: ["Tier 1"] }],
        [{ kind: "bold", parts: ["Tier 2"] }],
        [{ kind: "bold", parts: ["Tier 3"] }],
      ]),
    );
  });

  it("leaves no rule file placeholder in the rulebook", () => {
    expect(JSON.stringify(PARSED_RULEBOOK)).not.toMatch(/\.txt\}/);
  });
});
