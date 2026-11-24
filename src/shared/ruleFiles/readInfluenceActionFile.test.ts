import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readInfluenceActionFile } from "./readInfluenceActionFile";

const INFLUENCE_ACTION_FILE = readFileSync("harness/spec/influence-actions.txt", "utf8");

describe("readInfluenceActionFile", () => {
  it("reads every line of influence-actions.txt as one action in the same order", () => {
    const read = readInfluenceActionFile(INFLUENCE_ACTION_FILE);
    const namesOfTheLines = INFLUENCE_ACTION_FILE.trimEnd()
      .split(/\r?\n/)
      .map((line) => line.split(" | ")[0]?.replaceAll(" ", "_"));
    expect(read.isOk ? read.value.map(({ name }) => name) : read.error).toEqual(namesOfTheLines);
  });

  it("reads a rising build pass and a draw action", () => {
    expect(
      readInfluenceActionFile(
        "buy build pass | pay 20 funds, 10 more each time | get 1 build pass | no limit\ndraw tier 2 | pay 4 influence, 1 quality | draw a tier 2 card of a chosen kind | no limit",
      ),
    ).toEqual({
      isOk: true,
      value: [
        {
          kind: "trade",
          name: "buy_build_pass",
          costs: { funds: 20 },
          gains: {},
          buildPasses: 1,
          isPriceRising: true,
          limitPerGame: null,
        },
        {
          kind: "draw",
          name: "draw_tier_2",
          costs: { influence: 4, quality: 1 },
          tier: 2,
          limitPerGame: null,
        },
      ],
    });
  });

  it("reads several build passes and a limit of several uses", () => {
    expect(
      readInfluenceActionFile(
        "big pass | pay 3 influence, 1 fund | get 2 build passes, 1 quality | 4 per game",
      ),
    ).toEqual({
      isOk: true,
      value: [
        {
          kind: "trade",
          name: "big_pass",
          costs: { influence: 3, funds: 1 },
          gains: { quality: 1 },
          buildPasses: 2,
          isPriceRising: false,
          limitPerGame: 4,
        },
      ],
    });
  });
});
