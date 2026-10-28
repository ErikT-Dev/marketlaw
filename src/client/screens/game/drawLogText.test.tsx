import { describe, expect, it } from "vitest";
import { drawLogText } from "./drawLogText";

const NAMES = ["Ann", "Bea"];

describe("drawLogText", () => {
  it("says who drew how many cards of which sector and tier, and why", () => {
    expect(
      drawLogText(
        {
          kind: "draw",
          turn: 3,
          seat: 2,
          cause: "income",
          count: 1,
          asked: { by: "sector", sector: "Public", tier: 2 },
        },
        NAMES,
      ),
    ).toBe("Bea drew 1 card: Public, tier 2 (income)");
  });

  it("says which cards a discard shuffle put into the deck", () => {
    expect(
      drawLogText(
        {
          kind: "shuffle",
          turn: 3,
          seat: 1,
          asked: { by: "kind", kind: "Public quality card", tier: 1 },
          count: 4,
        },
        NAMES,
      ),
    ).toBe("Discard shuffle: 4 Public quality, tier 1 cards went into the deck");
    expect(drawLogText({ kind: "shuffle", turn: 3, seat: 1, asked: null, count: 12 }, NAMES)).toBe(
      "Discard shuffle: the whole discard pile, 12 cards, went into the deck",
    );
  });
});
