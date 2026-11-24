import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GameResult } from "../../../shared/GameResult";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { gamePageProps } from "../../testing/gamePageProps";
import { photoLoaderThatDecodes } from "../../testing/photoLoaderThatDecodes";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { statAndTypeWordsShownIn } from "../../testing/statAndTypeWordsShownIn";
import { GamePage } from "../GamePage";
import { PhotoLoading } from "./PhotoLoading";
import { scorePartsAddingUpTo } from "../../testing/scorePartsAddingUpTo";
import { NO_SUMMARY_COUNTS } from "../../../shared/testing/NO_SUMMARY_COUNTS";

const OWN: Partial<OwnSeatView> = {
  hand: ["Farm House", "Loft"],
  handDetails: [
    { card: "Farm House", realCost: 6, sameSectorAndTierInCity: 2, playRejection: null },
    { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "not_enough_funds" },
  ],
  city: ["Row House", "Fire Station", "Fast Food Restaurant"],
  typeCounts: { "Town Housing": 1, Safety: 1, Food: 1 },
  combos: [
    { card: "Row House", combo: 0, claimedTimes: 0, readyTimes: 1 },
    { card: "Fire Station", combo: 0, claimedTimes: 0, readyTimes: 0 },
  ],
  claimAllRejection: null,
  projectRejections: {
    quality: null,
    satisfaction: "project_needs_not_met",
    workforce: "project_already_completed",
  },
  projects: ["workforce"],
};

const VIEW: Partial<PlayerView> = {
  bonusTypes: ["Safety", "Retail"],
  quests: [
    {
      quest: "Trading post",
      turnsLeft: 3,
      isInExtraTurn: false,
      completeRejection: "quest_needs_not_met",
      progress: [
        {
          seat: 2,
          isCompleted: false,
          canCompleteNow: false,
          have: [4, 1],
          negativeStats: [{ stat: "workforce", value: -1 }],
        },
      ],
    },
  ],
  drawLog: [
    {
      kind: "draw",
      turn: 2,
      seat: 1,
      cause: "income",
      count: 1,
      asked: { by: "sector", sector: "Service", tier: 1 },
    },
  ],
};

const ENDED: GameResult = {
  endedBy: "end_goal",
  places: [
    {
      seat: 3,
      score: 512,
      scorePartsInHundredths: scorePartsAddingUpTo(512),
      bonusTypePoints: 6,
      leftInTurn: null,
      hasReachedEndGoal: true,
      income: 23,
      fundsAndHand: 20,
      counts: NO_SUMMARY_COUNTS,
    },
    {
      seat: 2,
      score: 487,
      scorePartsInHundredths: scorePartsAddingUpTo(487),
      bonusTypePoints: 6,
      leftInTurn: null,
      hasReachedEndGoal: false,
      income: 15,
      fundsAndHand: 20,
      counts: NO_SUMMARY_COUNTS,
    },
  ],
};

async function showGame(view: Partial<PlayerView> = VIEW, code: ReasonCode | null = null) {
  const props = gamePageProps(roomUpdateWith(view, OWN));
  const rejectedMove =
    code === null ? null : { action: { type: "play_card", card: "Loft" } as const, code };
  render(
    <PhotoLoading value={photoLoaderThatDecodes(() => true)}>
      <GamePage {...props} rejectedMove={rejectedMove} />
    </PhotoLoading>,
  );
  await act(async () => Promise.resolve());
}

function press(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("stats and types as icons", () => {
  it("shows no stat or type as a word on the game screen", async () => {
    await showGame();
    expect(statAndTypeWordsShownIn(document.body)).toEqual([]);
  });

  it.each([
    ["Projects", "Projects"],
    ["Use Influence", "Use Influence"],
    ["Claim all (1)", "Claim all combos"],
    ["Detailed summary table of Di", "Detailed summary table of Di"],
  ])("shows no stat or type as a word in the pop-up opened by %s", async (button, dialog) => {
    await showGame();
    press(button);
    expect(statAndTypeWordsShownIn(screen.getByRole("dialog", { name: dialog }))).toEqual([]);
  });

  it("shows no stat or type as a word in the help texts", async () => {
    await showGame();
    press("How quests work");
    press("How projects work");
    expect(statAndTypeWordsShownIn(document.body)).toEqual([]);
  });

  it("shows no stat or type as a word on the big card and in sell mode", async () => {
    await showGame();
    fireEvent.click(screen.getByRole("button", { name: /^Loft/ }));
    expect(statAndTypeWordsShownIn(document.body)).toEqual([]);
    press("Sell cards");
    fireEvent.click(screen.getByRole("button", { name: /^Farm House/ }));
    expect(statAndTypeWordsShownIn(document.body)).toEqual([]);
  });

  it.each<ReasonCode>([
    "not_enough_funds",
    "no_build_pass",
    "quest_needs_not_met",
    "project_needs_not_met",
    "trade_limit_reached",
  ])("shows no stat or type as a word in the rejection message for %s", async (code) => {
    await showGame(VIEW, code);
    expect(statAndTypeWordsShownIn(screen.getByRole("alert"))).toEqual([]);
  });

  it("shows no stat or type as a word on the end-of-game screen", async () => {
    await showGame({ ...VIEW, phase: "ended", result: ENDED });
    expect(statAndTypeWordsShownIn(document.body)).toEqual([]);
  });

  it("finds a stat written as a word", () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "You need 3 funds and 1 Retail.";
    expect(statAndTypeWordsShownIn(paragraph)).toEqual(["funds", "Retail"]);
  });
});
