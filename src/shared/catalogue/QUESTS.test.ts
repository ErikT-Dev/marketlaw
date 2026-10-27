import { describe, expect, it } from "vitest";
import { QUESTS } from "./QUESTS";

describe("QUESTS", () => {
  it("lists 15 quests in each tier", () => {
    expect(QUESTS).toHaveLength(45);
    expect(QUESTS.filter((quest) => quest.tier === 2)).toHaveLength(15);
    expect(QUESTS.filter((quest) => quest.tier === 3)).toHaveLength(15);
  });

  it("lists the quests of R20.7 in order with their tiers", () => {
    expect([QUESTS[0], QUESTS[10], QUESTS[15], QUESTS[29], QUESTS[30], QUESTS[44]]).toEqual([
      { name: "Working district", tier: 1 },
      { name: "Workers' housing", tier: 1 },
      { name: "Growing suburbs", tier: 2 },
      { name: "Service boom", tier: 2 },
      { name: "Penthouses", tier: 3 },
      { name: "High-tech economy", tier: 3 },
    ]);
  });
});
