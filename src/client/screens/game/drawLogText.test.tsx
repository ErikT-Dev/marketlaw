import { describe, expect, it } from "vitest";
import { drawLogText } from "./drawLogText";

const NAMES = ["Ann", "Bea"];

describe("drawLogText", () => {
  it("says who drew how many cards of which sector and tier, and why", () => {
    expect(
      drawLogText(
        [
          {
            kind: "draw",
            turn: 3,
            seat: 2,
            cause: "income",
            count: 1,
            asked: { by: "sector", sector: "Public", tier: 2 },
          },
        ],
        NAMES,
      ),
    ).toBe("Bea drew 1 card: Public, tier 2 (income)");
  });

  it("says which cards a discard shuffle put into the deck", () => {
    expect(
      drawLogText(
        [
          {
            kind: "shuffle",
            turn: 3,
            seat: 1,
            asked: { by: "kind", kind: "Public quality card", tier: 1 },
            count: 4,
          },
        ],
        NAMES,
      ),
    ).toBe("Discard shuffle: 4 Public quality, tier 1 cards went into the deck");
    expect(
      drawLogText([{ kind: "shuffle", turn: 3, seat: 1, asked: null, count: 12 }], NAMES),
    ).toBe("Discard shuffle: the whole discard pile, 12 cards, went into the deck");
  });

  it("says which marketplace card a turn draw took and what it drew from the deck", () => {
    const asked = { by: "sector", sector: "Public", tier: 1 } as const;
    expect(
      drawLogText(
        [
          {
            kind: "turn_draw",
            turn: 4,
            seat: 1,
            choice: { option: "A", card: "Trauma Center" },
            count: 1,
            asked,
          },
        ],
        NAMES,
      ),
    ).toBe("Ann took Trauma Center from the marketplace and drew 1 card: Public, tier 1");
    expect(
      drawLogText(
        [
          {
            kind: "turn_draw",
            turn: 4,
            seat: 2,
            choice: { option: "B", sector: "Public" },
            count: 2,
            asked,
          },
        ],
        NAMES,
      ),
    ).toBe("Bea skipped the marketplace and drew 2 cards: Public, tier 1");
  });

  it("says when a marketplace refill shuffled the discard pile", () => {
    expect(
      drawLogText([{ kind: "shuffle", turn: 5, seat: null, asked: null, count: 3 }], NAMES),
    ).toBe(
      "Discard shuffle for the marketplace: the whole discard pile, 3 cards, went into the deck",
    );
  });
});
