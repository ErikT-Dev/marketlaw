import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readQuestFile } from "./readQuestFile";

const QUEST_FILE = readFileSync("harness/spec/quests.txt", "utf8");

describe("readQuestFile", () => {
  it("reads every line of quests.txt as one quest in the same order", () => {
    const read = readQuestFile(QUEST_FILE);
    const namesOfTheLines = QUEST_FILE.trimEnd()
      .split(/\r?\n/)
      .map((line) => line.split(" | ")[1]);
    expect(read.isOk ? read.value.map(({ name }) => name) : read.error).toEqual(namesOfTheLines);
  });

  it("reads a file with Windows line breaks like one with plain line breaks", () => {
    expect(readQuestFile(QUEST_FILE.replaceAll("\n", "\r\n"))).toEqual(readQuestFile(QUEST_FILE));
  });

  it("reads every kind of requirement and reward", () => {
    const line =
      "Tier 3 | Every part | 2 cards of each sector, 1 sector with a tier 3 card, 1 completed project, 2 tier 3 Public cards, 1 tier 2 Industry card, 1 Service type, 3 quality, 2 product, 1 distribution, income 9 | +1 fund, +2 funds, gain 1 Service type, draw 1 card";
    expect(readQuestFile(line)).toEqual({
      isOk: true,
      value: [
        {
          tier: 3,
          name: "Every part",
          terms: {
            needs: [
              { kind: "cards", sector: "Residential", tier: "any", count: 2 },
              { kind: "cards", sector: "Industry", tier: "any", count: 2 },
              { kind: "cards", sector: "Service", tier: "any", count: 2 },
              { kind: "cards", sector: "Public", tier: "any", count: 2 },
              { kind: "sectors_with_tier", tier: 3, count: 1 },
              { kind: "projects", count: 1 },
              { kind: "cards", sector: "Public", tier: 3, count: 2 },
              { kind: "cards", sector: "Industry", tier: 2, count: 1 },
              { kind: "type", type: "Service", count: 1 },
              { kind: "stat", stat: "quality", count: 3 },
              { kind: "stat", stat: "product", count: 2 },
              { kind: "stat", stat: "distribution", count: 1 },
              { kind: "income", count: 9 },
            ],
            reward: { stats: { funds: 3 }, gainedType: "Service", draws: 1 },
          },
        },
      ],
    });
  });

  it("rejects a tier that is not 1, 2 or 3", () => {
    expect(readQuestFile("Tier 2 | Wrong tier | 3 tier 4 Residential cards | +1 fund")).toEqual({
      isOk: false,
      error: [{ line: 1, word: "4", message: "needs tier 1, 2 or 3" }],
    });
  });

  it("rejects the old form naming two tiers", () => {
    const read = readQuestFile("Tier 2 | Two tiers | 3 tier 2 or 3 Residential cards | +1 fund");
    expect(read.isOk).toBe(false);
  });
});
