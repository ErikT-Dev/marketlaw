import { describe, expect, it } from "vitest";
import { QUESTS } from "./QUESTS";

describe("QUESTS", () => {
  it("lists 15 quests in each tier", () => {
    expect(QUESTS).toHaveLength(45);
    expect(QUESTS.filter((quest) => quest.tier === 2)).toHaveLength(15);
    expect(QUESTS.filter((quest) => quest.tier === 3)).toHaveLength(15);
  });
});
