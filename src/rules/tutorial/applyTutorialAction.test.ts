import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../../shared/testing/GAME_STARTED_AT";
import { TUTORIAL_STEP_IDS } from "../../shared/TUTORIAL_STEP_IDS";
import type { TutorialStepId } from "../../shared/TutorialStepId";
import { seatOf } from "../seatOf";
import { applyTutorialAction } from "./applyTutorialAction";
import { startTutorial } from "./startTutorial";
import type { TutorialAction } from "./TutorialAction";
import type { TutorialState } from "./TutorialState";
import { TUTORIAL_STEPS } from "./TUTORIAL_STEPS";
import { tutorialViewFor } from "./tutorialViewFor";

function accepted(tutorial: TutorialState, action: TutorialAction): TutorialState {
  const result = applyTutorialAction(tutorial, action, GAME_STARTED_AT);
  if (!result.isOk) {
    throw new Error(`${action.type} rejected: ${result.error.code}`);
  }
  return result.value;
}

function tutorialAt(step: TutorialStepId): TutorialState {
  return TUTORIAL_STEP_IDS.slice(0, TUTORIAL_STEP_IDS.indexOf(step)).reduce(
    (tutorial, passed) => accepted(tutorial, TUTORIAL_STEPS[passed].accepts),
    startTutorial(GAME_STARTED_AT),
  );
}

const OTHER_ACTIONS: ReadonlyArray<readonly [string, TutorialStepId, TutorialAction]> = [
  ["a card on a continue step", "T1.1", { type: "play_card", seat: 1, card: "Row House" }],
  ["another card", "T1.2", { type: "play_card", seat: 1, card: "Cottage" }],
  ["continue on a card step", "T1.2", { type: "continue" }],
  ["selling another card", "T1.3", { type: "sell", seat: 1, cards: ["Pub"] }],
  ["selling more cards", "T1.3", { type: "sell", seat: 1, cards: ["Hiking Trail", "Pub"] }],
  ["another draw option", "T2.2", { type: "turn_draw", seat: 1, choice: { option: "B", sector: "Public" } }],
  ["another marketplace card", "T2.2", { type: "turn_draw", seat: 1, choice: { option: "A", card: "Clinic" } }],
  ["another sector", "T3.1", { type: "turn_draw", seat: 1, choice: { option: "B", sector: "Service" } }],
  ["ending the turn instead of claiming all", "T2.4", { type: "end_turn", seat: 1 }],
  ["claiming all instead of ending the turn", "T2.5", { type: "claim_all", seat: 1 }],
  ["undo", "T2.4", { type: "undo", seat: 1 }],
  ["another quest", "T5.3", { type: "complete_quest", seat: 1, quest: "Green city" }],
  ["a vote", "T3.2", { type: "call_vote", seat: 1 }],
];

describe("applyTutorialAction", () => {
  it.each(OTHER_ACTIONS)("rejects %s with not_this_step and changes nothing", (...[, step, action]) => {
    const tutorial = tutorialAt(step);
    expect(applyTutorialAction(tutorial, action, GAME_STARTED_AT)).toEqual({
      isOk: false,
      error: { code: "not_this_step" },
    });
  });

  it("accepts the step action whatever order its fields come in", () => {
    const sold = accepted(tutorialAt("T1.3"), { cards: ["Hiking Trail"], seat: 1, type: "sell" });
    expect(sold.stage).toBe("T1.4");
  });

  it("numbers the steps from 1 to 19 in the view", () => {
    const numbers = TUTORIAL_STEP_IDS.map((step) => tutorialViewFor(tutorialAt(step)).progress);
    expect(numbers).toEqual(
      TUTORIAL_STEP_IDS.map((step, index) => ({ kind: "step", step, number: index + 1 })),
    );
  });

  it("completes after the last step and then rejects every action", () => {
    const complete = accepted(tutorialAt("T5.4"), { type: "continue" });
    expect(tutorialViewFor(complete).progress).toEqual({ kind: "complete" });
    expect(applyTutorialAction(complete, { type: "continue" }, GAME_STARTED_AT).isOk).toBe(false);
    expect(applyTutorialAction(complete, { type: "end_turn", seat: 1 }, GAME_STARTED_AT)).toEqual({
      isOk: false,
      error: { code: "not_this_step" },
    });
  });

  it("ends with the first income and the first completed quest", () => {
    const seat = seatOf(tutorialAt("T5.4").game, 1);
    expect(seat?.stats).toMatchObject({ funds: 1, income: 4, influence: 6 });
    expect(seat?.questsCompleted).toEqual(["Trading post"]);
  });

  it("gives every player the same tutorial", () => {
    const later = GAME_STARTED_AT + 60_000;
    const first = startTutorial(GAME_STARTED_AT);
    const second = startTutorial(later);
    expect(second.game.deck).toEqual(first.game.deck);
    expect(second.game.marketplace).toEqual(first.game.marketplace);
    expect(second.game.seats[0]?.hand).toEqual(first.game.seats[0]?.hand);
  });

  it("starts again from the first step with the starting state", () => {
    expect(startTutorial(GAME_STARTED_AT)).toEqual(tutorialAt("T1.1"));
  });
});
