import { describe, expect, it } from "vitest";
import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import { chaosBot } from "./chaosBot";
import { legalBot } from "./legalBot";
import { ownSeatOf } from "./ownSeatOf";
import { botViewWith } from "./testing/botViewWith";
import { chooserFrom } from "./testing/chooserFrom";

const SEEDS = Array.from({ length: 200 }, (unused, index) => index + 1);
const MARKETPLACE: ReadonlyArray<MarketplaceSlot> = [
  { place: "residential", card: "Row House", phasesShown: 0 },
  { place: "industry", card: null, phasesShown: 0 },
  { place: "open_1", card: "Dentist", phasesShown: 1 },
];

function marketView(rejections: {
  turnDraw: "not_your_go" | null;
  marketCard: "marketplace_empty" | "not_your_go" | null;
}) {
  return {
    ...botViewWith({
      turnDrawRejection: rejections.turnDraw,
      marketCardRejection: rejections.marketCard,
    }),
    phase: "market" as const,
    marketGo: rejections.turnDraw === null ? (1 as const) : (2 as const),
    marketplace: MARKETPLACE,
  };
}

describe("legal bot in the market phase", () => {
  it("takes a marketplace card or draws from a sector on its go", () => {
    const view = marketView({ turnDraw: null, marketCard: null });
    const choices = SEEDS.flatMap((seed) => {
      const move = legalBot(view, chooserFrom(seed));
      return move?.type === "turn_draw" ? [move.choice] : [];
    });
    expect(choices).toHaveLength(SEEDS.length);
    const taken = choices.flatMap((choice) => (choice.option === "A" ? [choice.card] : []));
    expect(new Set(taken)).toEqual(new Set(["Row House", "Dentist"]));
    expect(choices.some((choice) => choice.option === "B")).toBe(true);
  });

  it("draws from a sector when its view says the marketplace is empty", () => {
    const view = marketView({ turnDraw: null, marketCard: "marketplace_empty" });
    const options = SEEDS.map((seed) => {
      const move = legalBot(view, chooserFrom(seed));
      return move?.type === "turn_draw" ? move.choice.option : null;
    });
    expect(new Set(options)).toEqual(new Set(["B"]));
  });

  it("makes no move while it is another player's go", () => {
    const view = marketView({ turnDraw: "not_your_go", marketCard: "not_your_go" });
    expect(SEEDS.map((seed) => legalBot(view, chooserFrom(seed)))).toEqual(SEEDS.map(() => null));
  });
});

describe("chaos bot in the market phase", () => {
  it("asks only for cards that are neither held nor in the marketplace", () => {
    const base = marketView({ turnDraw: "not_your_go", marketCard: "not_your_go" });
    const hand = ownSeatOf(base).hand;
    const shown = CARD_NAMES.filter((card) => card !== "Dentist" && !hand.includes(card));
    const view = {
      ...base,
      marketplace: shown.map((card) => ({ place: "open_1" as const, card, phasesShown: 0 })),
    };
    const cards = SEEDS.flatMap((seed) => {
      const move = chaosBot(view, chooserFrom(seed));
      return move.kind === "intent" &&
        move.intent.type === "turn_draw" &&
        move.intent.choice.option === "A"
        ? [move.intent.choice.card]
        : [];
    });
    expect(cards.length).toBeGreaterThan(0);
    expect(new Set(cards)).toEqual(new Set(["Dentist"]));
  });
});
