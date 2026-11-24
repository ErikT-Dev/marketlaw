import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TutorialStepId } from "../../../shared/TutorialStepId";
import { TutorialMessage } from "./TutorialMessage";
import { tutorialTextBoxOf } from "./tutorialTextBoxOf";

function showStep(step: TutorialStepId, number: number) {
  const onContinue = vi.fn();
  const onRestart = vi.fn();
  render(
    <TutorialMessage
      content={tutorialTextBoxOf(step, number)}
      isConnected
      onContinue={onContinue}
      onRestart={onRestart}
    />,
  );
  return { onContinue, onRestart };
}

describe("the tutorial text box", () => {
  it("shows the welcome text with Continue and Restart on the first step", () => {
    const { onContinue, onRestart } = showStep("T1.1", 1);
    expect(screen.getByRole("heading", { name: "Step 1 of 19" })).toBeTruthy();
    expect(screen.getByText(/^Welcome, Mayor! You build a city/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("shows the sentence that asks for the action once, as the action line", () => {
    expect(tutorialTextBoxOf("T1.2", 2)).toEqual({
      stepLine: "Step 2 of 19",
      paragraphs: ["Residential cards bring workforce, the people who staff your city."],
      actionLine: "Play Row House.",
      button: null,
    });
  });

  it("starts with the text after the step before it", () => {
    const content = tutorialTextBoxOf("T1.3", 3);
    expect(content.paragraphs).toEqual([
      "Every card also uses something up. Residents need quality and satisfaction, so those dropped below zero. While any of them is negative, you cannot earn income.",
      "Every card you play uses a build pass. You start with 2, get 1 more every turn and keep the ones you don't use. Cards you don't need can be sold for 10 funds each.",
    ]);
    expect(content.actionLine).toBe("Sell Hiking Trail.");
  });

  it("keeps a step text whose last sentence differs from the action line", () => {
    const content = tutorialTextBoxOf("T3.1", 10);
    expect(content.paragraphs).toEqual([
      "This time, skip the marketplace: choose Public and draw 2 cards from the deck.",
    ]);
    expect(content.actionLine).toBe("Draw 2 Public cards from the deck.");
  });

  it("shows only the action line on a step without text", () => {
    expect(tutorialTextBoxOf("T2.5", 9)).toEqual({
      stepLine: "Step 9 of 19",
      paragraphs: [],
      actionLine: "End your turn.",
      button: null,
    });
  });

  it("shows Finish instead of an action line on the last step", () => {
    const { onContinue } = showStep("T5.4", 19);
    expect(
      screen.getByText(
        "You were the first to complete it, so you got 2 funds more, 2 for every tier of the quest. Each quest stays a few turns, and any player can complete it once.",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
