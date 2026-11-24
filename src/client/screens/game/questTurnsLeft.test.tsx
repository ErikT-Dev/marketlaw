import { describe, expect, it } from "vitest";
import { QUEST_TURNS_ON_TABLE_OF_TIER } from "../../../shared/QUEST_TURNS_ON_TABLE_OF_TIER";
import { questTurnsLeftLookOf } from "./questTurnsLeftLookOf";

function looksFromFullTimeDown(turnsOnTable: number) {
  return [...Array.from({ length: turnsOnTable }).keys()].map((index) =>
    questTurnsLeftLookOf(turnsOnTable - index, turnsOnTable),
  );
}

describe("quest turns left colour", () => {
  it("colours a tier 1 quest blue at 6, green at 5 and 4, yellow at 3 and 2 and red at 1", () => {
    expect(looksFromFullTimeDown(QUEST_TURNS_ON_TABLE_OF_TIER[1])).toEqual([
      "full_time",
      "above_half",
      "above_half",
      "half_or_less",
      "half_or_less",
      "last_turn",
    ]);
  });

  it("colours a tier 2 quest blue at 5, green at 4 and 3, yellow at 2 and red at 1", () => {
    expect(looksFromFullTimeDown(QUEST_TURNS_ON_TABLE_OF_TIER[2])).toEqual([
      "full_time",
      "above_half",
      "above_half",
      "half_or_less",
      "last_turn",
    ]);
  });

  it("colours a tier 3 quest blue at 4, green at 3, yellow at 2 and red at 1", () => {
    expect(looksFromFullTimeDown(QUEST_TURNS_ON_TABLE_OF_TIER[3])).toEqual([
      "full_time",
      "above_half",
      "half_or_less",
      "last_turn",
    ]);
  });
});
