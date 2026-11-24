import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

describe("a rise in income", () => {
  it("shows no notice, since the Last turn panel shows it in the next turn", () => {
    const { rerender } = render(pageWithIncome(14));
    rerender(pageWithIncome(16));
    expect(incomeNotice()).toBeUndefined();
  });
});
