import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkRuleFiles } from "./checkRuleFiles.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";

const QUESTS_TEXT = readFileSync(HARNESS_PATHS.quests, "utf8");
const INFLUENCE_ACTIONS_TEXT = readFileSync(HARNESS_PATHS.influenceActions, "utf8");
const FIRST_QUEST =
  "Tier 1 | Working district | 3 Residential cards, 2 Low Wealth | +1 quality, +1 influence";
const FIRST_ACTION = "influence to funds | pay 4 influence | get 20 funds | 1 per game";

function messagesOf(questsText: string, influenceActionsText: string): ReadonlyArray<string> {
  return checkRuleFiles({ questsText, influenceActionsText }).map(
    ({ file, where, message }) => `${file} | ${where} | ${message}`,
  );
}

function problemsWithQuestLine(line: string): ReadonlyArray<string> {
  return messagesOf(QUESTS_TEXT.replace(FIRST_QUEST, line), INFLUENCE_ACTIONS_TEXT);
}

function problemsWithActionLine(line: string): ReadonlyArray<string> {
  return messagesOf(QUESTS_TEXT, INFLUENCE_ACTIONS_TEXT.replace(FIRST_ACTION, line));
}

function questProblem(message: string): string {
  return `${HARNESS_PATHS.quests} | line 1 | ${message}`;
}

function actionProblem(message: string): string {
  return `${HARNESS_PATHS.influenceActions} | line 1 | ${message}`;
}

const BROKEN_QUEST_LINES = [
  [
    "Tier 1 | Working district | 3 Residential cards",
    'the line needs four parts separated by " | ": "Tier 1 | Working district | 3 Residential cards"',
  ],
  [
    "Tier 4 | Working district | 3 Residential cards | +1 quality",
    'the tier is "Tier 1", "Tier 2" or "Tier 3": "Tier 4"',
  ],
  [
    "Tier 1 | working district | 3 Residential cards | +1 quality",
    'a quest name has letters, digits, spaces, apostrophes and hyphens, and starts with a capital letter: "working district"',
  ],
  [
    "Tier 1 | Working district | Residential cards | +1 quality",
    'needs a whole number from 1 to 999: "Residential"',
  ],
  [
    "Tier 1 | Working district | 1000 Residential cards | +1 quality",
    'needs a whole number from 1 to 999: "1000"',
  ],
  ["Tier 1 | Working district | 3 Residental cards | +1 quality", 'unknown sector: "Residental"'],
  [
    "Tier 1 | Working district | 3 tier 4 Residential cards | +1 quality",
    'needs tier 1, 2 or 3: "4"',
  ],
  [
    "Tier 1 | Working district | 3 tier 2 or 3 Residential cards | +1 quality",
    'unknown sector: "or 3 Residential"',
  ],
  [
    "Tier 1 | Working district | 3 Residential cards, 1 Low Welth | +1 quality",
    'unknown type, stat or sector: "Low Welth"',
  ],
  [
    "Tier 1 | Working district | 1 Service | +1 quality",
    'the Service type is written "Service type": "Service"',
  ],
  ["Tier 1 | Working district | 3 Residential cards | +1 qualty", 'unknown stat: "qualty"'],
  [
    "Tier 1 | Working district | 3 Residential cards | 1 quality",
    'a reward is "+N <stat>", "gain N <type>" or "draw N cards": "1 quality"',
  ],
  [
    "Tier 1 | Working district | 3 Residential cards | gain 1 Farm, gain 1 Sea",
    'needs new code: a quest gains at most 1 type: "gain 1 Sea"',
  ],
  [
    "Tier 1 | Working district | 3 Residential cards | +1 quality, ",
    'a reward is "+N <stat>", "gain N <type>" or "draw N cards": ""',
  ],
] as const;

const BROKEN_ACTION_LINES = [
  [
    "Influence to funds | pay 4 influence | get 20 funds | 1 per game",
    'a name has lower-case letters, digits and spaces: "Influence to funds"',
  ],
  [
    "influence to funds | 4 influence | get 20 funds | 1 per game",
    'the costs start with "pay ": "4 influence"',
  ],
  [
    "influence to funds | pay four influence | get 20 funds | 1 per game",
    'needs a whole number from 1 to 99: "four"',
  ],
  ["influence to funds | pay 4 influense | get 20 funds | 1 per game", 'unknown stat: "influense"'],
  ["influence to funds | pay 4 influence | get 20 fundz | 1 per game", 'unknown stat: "fundz"'],
  [
    "influence to funds | pay 4 influence | get 20 funds | once",
    'the limit is "N per game" or "no limit": "once"',
  ],
  [
    "influence to funds | pay 4 influence | get 20 funds | 100 per game",
    'the limit is "N per game" or "no limit": "100 per game"',
  ],
  [
    "influence to funds | pay 10 more each time, 40 funds | get 1 build pass | no limit",
    '"10 more each time" comes last: "10 more each time"',
  ],
  [
    "influence to funds | pay 20 funds, 1 more each time | get 1 build pass | no limit",
    'the rising price is "10 more each time": "1 more each time"',
  ],
  [
    "influence to funds | pay 4 influence | swap 20 funds | 1 per game",
    'needs new code: "influence to funds"',
  ],
  [
    "influence to funds | pay 4 influence | draw a tier 4 card of a chosen kind | no limit",
    'needs new code: "influence to funds"',
  ],
  [
    "influence to funds | pay 4 influence, 10 more each time | get 1 build pass | no limit",
    'needs new code: "influence to funds"',
  ],
  [
    "influence to funds | pay 4 influence | draw a tier 1 card of a chosen kind | 2 per game",
    'needs new code: "influence to funds"',
  ],
] as const;

describe("the rule file check", () => {
  it("finds no problem in the rule files as they are", () => {
    expect(messagesOf(QUESTS_TEXT, INFLUENCE_ACTIONS_TEXT)).toEqual([]);
  });

  it("accepts quest numbers up to 999", () => {
    expect(
      problemsWithQuestLine(
        "Tier 1 | Working district | 999 Residential cards, income 999 | +999 funds, draw 999 cards",
      ),
    ).toEqual([]);
  });

  it.each(BROKEN_QUEST_LINES)("reports the broken quest line %s", (line, message) => {
    expect(problemsWithQuestLine(line)).toEqual([questProblem(message)]);
  });

  it.each(BROKEN_ACTION_LINES)("reports the broken influence action line %s", (line, message) => {
    expect(problemsWithActionLine(line)).toEqual([actionProblem(message)]);
  });

  it("reports an empty line with its line number", () => {
    expect(messagesOf(`\n${QUESTS_TEXT}`, INFLUENCE_ACTIONS_TEXT)).toEqual([
      questProblem('empty line: ""'),
    ]);
  });

  it("reports a quest name used twice with capital letters ignored", () => {
    const twice = `${FIRST_QUEST}\nTier 1 | WORKING DISTRICT | 1 Farm | +1 fund`;
    expect(problemsWithQuestLine(twice)).toEqual([
      `${HARNESS_PATHS.quests} | line 2 | the name is already used on line 1: "WORKING DISTRICT"`,
    ]);
  });

  it("reports fewer than 4 tier 1 quests and a missing tutorial quest", () => {
    const kept = ["Working district", "Fishing village", "Trading post"];
    const fewer = QUESTS_TEXT.split("\n")
      .filter((line) => !line.startsWith("Tier 1") || kept.some((name) => line.includes(name)))
      .join("\n");
    expect(messagesOf(fewer, INFLUENCE_ACTIONS_TEXT)).toEqual([
      `${HARNESS_PATHS.quests} | whole file | 3 tier 1 quests can be placed at the start (at most income 50 and no completed project); the starting table needs 4 (R19.3, R19.11)`,
      `${HARNESS_PATHS.quests} | Green city | the tutorial (T0.7) needs this tier 1 quest`,
    ]);
  });

  it("counts only the tier 1 quests that can be placed at the start", () => {
    const kept = ["Working district", "Fishing village", "Trading post"];
    const heldBack = [
      "Tier 1 | Rich town | income 60 | +10 funds",
      "Tier 1 | Planned town | 1 completed project | +10 funds",
    ];
    const fewer = [
      ...heldBack,
      ...QUESTS_TEXT.split("\n").filter(
        (line) => !line.startsWith("Tier 1") || kept.some((name) => line.includes(name)),
      ),
    ].join("\n");
    expect(messagesOf(fewer, INFLUENCE_ACTIONS_TEXT)).toEqual([
      `${HARNESS_PATHS.quests} | whole file | 3 tier 1 quests can be placed at the start (at most income 50 and no completed project); the starting table needs 4 (R19.3, R19.11)`,
      `${HARNESS_PATHS.quests} | Green city | the tutorial (T0.7) needs this tier 1 quest`,
    ]);
  });

  it("reports a tutorial quest that is no longer tier 1", () => {
    expect(problemsWithQuestLine(FIRST_QUEST.replace("Tier 1", "Tier 2"))).toEqual([
      `${HARNESS_PATHS.quests} | Working district | the tutorial (T0.7) needs this tier 1 quest`,
    ]);
  });

  it("reports a changed Trading post", () => {
    const changed = QUESTS_TEXT.replace("income 40, 1 Retail", "income 50, 1 Retail");
    expect(messagesOf(changed, INFLUENCE_ACTIONS_TEXT)).toEqual([
      `${HARNESS_PATHS.quests} | Trading post | the tutorial (T0.7) needs exactly "Tier 1 | Trading post | income 40, 1 Retail | +10 funds, +2 influence"`,
    ]);
  });

  it("reports an influence action name used twice", () => {
    expect(problemsWithActionLine(`${FIRST_ACTION}\n${FIRST_ACTION}`)).toEqual([
      `${HARNESS_PATHS.influenceActions} | line 2 | the name is already used on line 1: "influence_to_funds"`,
    ]);
  });

  it("reports a second line with a rising price as needing new code", () => {
    const secondRising =
      "influence to funds | pay 30 funds, 10 more each time | get 1 build pass | no limit";
    const risingLine = INFLUENCE_ACTIONS_TEXT.split("\n").findIndex((line) =>
      line.startsWith("buy build pass"),
    );
    expect(problemsWithActionLine(secondRising)).toEqual([
      `${HARNESS_PATHS.influenceActions} | line ${String(risingLine + 1)} | needs new code: "buy_build_pass"`,
    ]);
  });

  it("reports two draw actions for one tier", () => {
    const secondDraw =
      "draw tier 1 again | pay 10 funds | draw a tier 1 card of a chosen kind | no limit";
    const lineCount = INFLUENCE_ACTIONS_TEXT.trimEnd().split("\n").length;
    expect(messagesOf(QUESTS_TEXT, `${INFLUENCE_ACTIONS_TEXT}${secondDraw}\n`)).toEqual([
      `${HARNESS_PATHS.influenceActions} | line ${String(lineCount + 1)} | a draw action for tier 1 is already on line ${String(lineCount - 2)}: "draw_tier_1_again"`,
    ]);
  });
});
