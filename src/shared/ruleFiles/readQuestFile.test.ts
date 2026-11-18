import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QUEST_TERMS } from "../catalogue/QUEST_TERMS";
import { QUESTS } from "../catalogue/QUESTS";
import { readQuestFile } from "./readQuestFile";

const QUEST_FILE = readFileSync("harness/spec/quests.txt", "utf8");

describe("readQuestFile", () => {
  it("reads every quest of quests.txt in order with the terms the game uses", () => {
    expect(readQuestFile(QUEST_FILE)).toEqual({
      isOk: true,
      value: QUESTS.map(({ name, tier }) => ({ tier, name, terms: QUEST_TERMS[name] })),
    });
  });

  it("reads a file with Windows line breaks like one with plain line breaks", () => {
    expect(readQuestFile(QUEST_FILE.replaceAll("\n", "\r\n"))).toEqual(readQuestFile(QUEST_FILE));
  });

  it("reads every kind of requirement and reward", () => {
    const line =
      "Tier 3 | Every part | 2 cards of each sector, 1 sector with a tier 3 card, 1 completed project, 2 tier 3 Public cards, 1 Service type, 3 quality, income 9 | +1 fund, +2 funds, gain 1 Service type, draw 1 card";
    expect(readQuestFile(line)).toEqual({
      isOk: true,
      value: [
        {
          tier: 3,
          name: "Every part",
          terms: {
            needs: [
              { kind: "cards", sector: "Residential", lowestTier: 1, count: 2 },
              { kind: "cards", sector: "Industry", lowestTier: 1, count: 2 },
              { kind: "cards", sector: "Service", lowestTier: 1, count: 2 },
              { kind: "cards", sector: "Public", lowestTier: 1, count: 2 },
              { kind: "sectors_with_tier", tier: 3, count: 1 },
              { kind: "projects", count: 1 },
              { kind: "cards", sector: "Public", lowestTier: 3, count: 2 },
              { kind: "type", type: "Service", count: 1 },
              { kind: "stat", stat: "quality", count: 3 },
              { kind: "income", count: 9 },
            ],
            reward: { stats: { funds: 3 }, gainedType: "Service", draws: 1 },
          },
        },
      ],
    });
  });
});
