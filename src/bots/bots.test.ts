import { describe, expect, it } from "vitest";
import { Kind } from "../shared/catalogue/Kind";
import { Tier } from "../shared/catalogue/Tier";
import type { OwnSeatView } from "../shared/OwnSeatView";
import { TradeName } from "../shared/TradeName";
import { chaosBot } from "./chaosBot";
import { legalBot } from "./legalBot";
import { OWN_SEAT_VIEW } from "../shared/testing/OWN_SEAT_VIEW";
import { botViewWith } from "./testing/botViewWith";
import { chooserFrom } from "./testing/chooserFrom";

const SEEDS = Array.from({ length: 300 }, (unused, index) => index + 1);

describe("legal bot", () => {
  it("only plays cards its view marks playable and only sells cards it holds", () => {
    const view = botViewWith({});
    const moves = SEEDS.map((seed) => legalBot(view, chooserFrom(seed)));
    const played = moves.flatMap((move) => (move?.type === "play_card" ? [move.card] : []));
    const sold = moves.flatMap((move) => (move?.type === "sell" ? move.cards : []));
    expect(played.every((card) => ["Farm House", "Pub", "Cottage"].includes(card))).toBe(true);
    expect(new Set(played)).toContain("Farm House");
    expect(new Set(played)).toContain("Cottage");
    expect(
      sold.every((card) => view.seats[0]?.kind === "own" && view.seats[0].hand.includes(card)),
    ).toBe(true);
  });

  it("ends its turn when nothing worth playing is left", () => {
    const view = botViewWith({ handDetails: [] });
    const moves = SEEDS.map((seed) => legalBot(view, chooserFrom(seed))?.type);
    expect(moves).toContain("end_turn");
    expect(moves).not.toContain("play_card");
  });

  it("prefers the kind of card that fixes its weakest stat", () => {
    const view = botViewWith({
      stats: { ...OWN_SEAT_VIEW.stats, workforce: 3, quality: 0, satisfaction: 2 },
    });
    const played = SEEDS.map((seed) => legalBot(view, chooserFrom(seed))).flatMap((move) =>
      move?.type === "play_card" ? [move.card] : [],
    );
    expect(played.filter((card) => card === "Pub").length).toBeLessThan(played.length / 2);
    const withQualityCard = botViewWith({
      stats: { ...OWN_SEAT_VIEW.stats, workforce: 3, quality: 0, satisfaction: 2 },
      hand: ["Fire Station", "Pub"],
      handDetails: [
        { card: "Fire Station", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
        { card: "Pub", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
      ],
    });
    const choices = SEEDS.map((seed) => legalBot(withQualityCard, chooserFrom(seed)));
    expect(
      choices.filter((move) => move?.type === "play_card" && move.card === "Fire Station").length,
    ).toBeGreaterThan(
      choices.filter((move) => move?.type === "play_card" && move.card === "Pub").length,
    );
  });

  it("claims ready combos and completes a project it can complete before anything else", () => {
    const canClaim = botViewWith({ claimAllRejection: null });
    expect(new Set(SEEDS.map((seed) => legalBot(canClaim, chooserFrom(seed))?.type))).toEqual(
      new Set(["claim_all"]),
    );
    const canComplete = botViewWith({
      projectRejections: {
        quality: "project_needs_not_met",
        satisfaction: null,
        workforce: "project_needs_not_met",
      },
    });
    expect(
      SEEDS.map((seed) => legalBot(canComplete, chooserFrom(seed))).every(
        (move) => move?.type === "complete_project" && move.project === "satisfaction",
      ),
    ).toBe(true);
  });

  it("completes a quest its view says it can complete", () => {
    const view = {
      ...botViewWith({}),
      quests: [
        { quest: null },
        {
          quest: "Farmland",
          turnsLeft: 5,
          isInExtraTurn: false,
          completeRejection: "quest_needs_not_met",
          progress: [],
        },
        {
          quest: "Sports town",
          turnsLeft: 5,
          isInExtraTurn: false,
          completeRejection: null,
          progress: [],
        },
      ] as const,
    };
    expect(new Set(SEEDS.map((seed) => JSON.stringify(legalBot(view, chooserFrom(seed)))))).toEqual(
      new Set([JSON.stringify({ type: "complete_quest", quest: "Sports town" })]),
    );
  });

  it("aims at the open project whose stat is closest to 8", () => {
    function playedWith(projects: OwnSeatView["projects"]) {
      const view = botViewWith({
        stats: { ...OWN_SEAT_VIEW.stats, workforce: 3, quality: 4, satisfaction: 6 },
        projects,
        hand: ["Public Playground", "Fire Station"],
        handDetails: [
          {
            card: "Public Playground",
            realCost: 4,
            sameSectorAndTierInCity: 0,
            playRejection: null,
          },
          { card: "Fire Station", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
        ],
      });
      return SEEDS.map((seed) => legalBot(view, chooserFrom(seed))).flatMap((move) =>
        move?.type === "play_card" ? [move.card] : [],
      );
    }
    const towardSatisfaction = playedWith([]);
    expect(
      towardSatisfaction.filter((card) => card === "Public Playground").length,
    ).toBeGreaterThan(towardSatisfaction.filter((card) => card === "Fire Station").length * 2);
    const towardQuality = playedWith(["satisfaction"]);
    expect(towardQuality.filter((card) => card === "Fire Station").length).toBeGreaterThan(
      towardQuality.filter((card) => card === "Public Playground").length * 2,
    );
  });

  it("sometimes undoes, trades or takes a draw action, only ones its view allows", () => {
    const view = botViewWith({
      undoRejection: null,
      trades: TradeName.options.map((trade) => ({
        trade,
        rejection: trade === "fund_to_influence" ? null : "cannot_afford_trade",
      })),
      drawActions: Kind.options.flatMap((kind) =>
        Tier.options.map((tier) => ({
          kind,
          tier,
          isAnyLeft: kind === "Industry" && tier === 1,
          rejection: kind === "Industry" && tier === 1 ? null : "no_card_of_kind",
        })),
      ),
    });
    const moves = SEEDS.map((seed) => legalBot(view, chooserFrom(seed)));
    expect(moves).toContainEqual({ type: "undo" });
    const traded = moves.filter((move) => move?.type === "influence");
    const drawn = moves.filter((move) => move?.type === "draw_action");
    expect(traded.length).toBeGreaterThan(0);
    expect(drawn.length).toBeGreaterThan(0);
    expect(traded.every((move) => move.trade === "fund_to_influence")).toBe(true);
    expect(drawn.every((move) => move.kind === "Industry" && move.tier === 1)).toBe(true);
  });

  it("does not sell when selling would be rejected and makes no move when done", () => {
    const cannotSell = botViewWith({ sellRejection: "action_limit_reached", handDetails: [] });
    expect(SEEDS.map((seed) => legalBot(cannotSell, chooserFrom(seed))?.type)).not.toContain(
      "sell",
    );
    expect(legalBot(botViewWith({ endTurnRejection: "already_done" }), chooserFrom(1))).toBeNull();
  });
});

describe("chaos bot", () => {
  it("sends stale versions only with moves that would otherwise be legal", () => {
    const view = botViewWith({});
    const stale = SEEDS.map((seed) => chaosBot(view, chooserFrom(seed))).flatMap((move) =>
      move.kind === "stale" ? [move.intent] : [],
    );
    expect(stale.length).toBeGreaterThan(0);
    expect(
      stale.every(
        (intent) =>
          intent.type !== "play_card" || ["Farm House", "Pub", "Cottage"].includes(intent.card),
      ),
    ).toBe(true);
  });

  it("sends legal moves, illegal moves, stale moves, repeats and malformed text", () => {
    const view = botViewWith({});
    const moves = SEEDS.map((seed) => chaosBot(view, chooserFrom(seed)));
    expect(new Set(moves.map((move) => move.kind))).toEqual(
      new Set(["intent", "stale", "repeat", "raw"]),
    );
    const plays = moves.flatMap((move) =>
      (move.kind === "intent" || move.kind === "stale") && move.intent.type === "play_card"
        ? [move.intent.card]
        : [],
    );
    expect(plays).toContain("Dorm");
    expect(
      plays.some((card) => !["Farm House", "Dorm", "Pub", "Cottage", "Loft"].includes(card)),
    ).toBe(true);
  });
});
