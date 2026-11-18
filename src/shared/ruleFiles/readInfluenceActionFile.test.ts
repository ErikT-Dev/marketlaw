import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DRAW_ACTION_COSTS } from "../DRAW_ACTION_COSTS";
import { TRADES } from "../TRADES";
import { readInfluenceActionFile } from "./readInfluenceActionFile";

const INFLUENCE_ACTION_FILE = readFileSync("harness/spec/influence-actions.txt", "utf8");

const TRADES_OF_THE_FILE = Object.entries(TRADES)
  .filter(([name]) => name !== "skip_build")
  .map(([name, trade]) => ({
    kind: "trade",
    name,
    costs: trade.costs,
    gains: trade.gains,
    buildPasses: trade.doesGiveBuildPass ? 1 : 0,
    isPriceRising: name === "buy_build_pass",
    limitPerGame: trade.limitPerGame,
  }));

const DRAWS_OF_THE_FILE = ([1, 2, 3] as const).map((tier) => ({
  kind: "draw",
  name: `draw_tier_${String(tier)}`,
  costs: { influence: DRAW_ACTION_COSTS[tier] },
  tier,
  limitPerGame: null,
}));

describe("readInfluenceActionFile", () => {
  it("reads every action of influence-actions.txt in order with the terms the game uses", () => {
    expect(readInfluenceActionFile(INFLUENCE_ACTION_FILE)).toEqual({
      isOk: true,
      value: [...TRADES_OF_THE_FILE, ...DRAWS_OF_THE_FILE],
    });
  });

  it("reads several build passes and a limit of several uses", () => {
    expect(
      readInfluenceActionFile(
        "big pass | pay 3 influence, 1 fund | get 2 build passes, 1 bonus | 4 per game",
      ),
    ).toEqual({
      isOk: true,
      value: [
        {
          kind: "trade",
          name: "big_pass",
          costs: { influence: 3, funds: 1 },
          gains: { bonus: 1 },
          buildPasses: 2,
          isPriceRising: false,
          limitPerGame: 4,
        },
      ],
    });
  });
});
