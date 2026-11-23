import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Stats } from "../../../shared/Stats";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";

const STATS: Stats = {
  funds: 7,
  income: 14,
  influence: 3,
  workforce: 6,
  quality: 5,
  satisfaction: 4,
  product: 2,
  distribution: 1,
};

function pageWithIncome(income: number) {
  return <GamePage {...gamePageProps(roomUpdateWith({}, { stats: { ...STATS, income } }))} />;
}

function incomeNotice() {
  return screen
    .queryAllByRole("status")
    .find((status) => textWithIconNames(status).includes("has increased!"));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("the End turn button", () => {
  it("is highlighted once you have played a card this turn", () => {
    const { rerender } = render(
      <GamePage {...gamePageProps(roomUpdateWith({}, { hasPlayedThisTurn: false }))} />,
    );
    expect(
      screen.queryByRole("button", {
        name: "End turn",
        description: "You have played a card this turn",
      }),
    ).toBeNull();
    rerender(<GamePage {...gamePageProps(roomUpdateWith({}, { hasPlayedThisTurn: true }))} />);
    expect(
      screen.getByRole("button", {
        name: "End turn",
        description: "You have played a card this turn",
      }),
    ).toBeDefined();
  });
});

describe("the income notice", () => {
  it("says your income has increased when it goes up and closes after 3 seconds", () => {
    vi.useFakeTimers();
    const { rerender } = render(pageWithIncome(14));
    expect(incomeNotice()).toBeUndefined();
    rerender(pageWithIncome(16));
    const notice = incomeNotice();
    expect(notice === undefined ? "" : textWithIconNames(notice)).toContain(
      "Your [Income] has increased!",
    );
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(incomeNotice()).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(incomeNotice()).toBeUndefined();
  });

  it("closes with its close button", () => {
    const { rerender } = render(pageWithIncome(14));
    rerender(pageWithIncome(15));
    fireEvent.click(screen.getByRole("button", { name: "Close: notice" }));
    expect(incomeNotice()).toBeUndefined();
  });

  it("is not shown when your income goes down", () => {
    const { rerender } = render(pageWithIncome(14));
    rerender(pageWithIncome(12));
    expect(incomeNotice()).toBeUndefined();
  });
});
