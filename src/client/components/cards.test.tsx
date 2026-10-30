import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { cardOf } from "../../shared/catalogue/cardOf";
import { BigCard } from "./BigCard";
import { HandCard } from "./HandCard";
import { PlayedCard } from "./PlayedCard";

const LOFT = cardOf("Loft");

describe("HandCard", () => {
  it("is named after the card and describes its number and real cost", () => {
    render(
      <HandCard
        card={LOFT}
        realCost={11}
        isPlayable
        state="default"
        isNew={false}
        isPending={false}
        onSelect={vi.fn()}
      />,
    );
    const card = screen.getByRole("button", {
      name: "Loft",
      description: "Number 24, real cost $11",
    });
    expect(card.getAttribute("aria-pressed")).toBe("false");
    expect(card.textContent).toContain("$11");
  });

  it("says when the card is new and cannot be played", () => {
    render(
      <HandCard
        card={LOFT}
        realCost={8}
        isPlayable={false}
        state="default"
        isNew
        isPending={false}
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "Loft",
        description: "Number 24, real cost $8, new, cannot be played",
      }),
    ).toBeDefined();
  });

  it("is pressed when selected or marked to sell and reports clicks", () => {
    const onSelect = vi.fn();
    const view = render(
      <HandCard
        card={LOFT}
        realCost={8}
        isPlayable
        state="selected"
        isNew={false}
        isPending={false}
        onSelect={onSelect}
      />,
    );
    const card = screen.getByRole("button", { name: "Loft" });
    expect(card.getAttribute("aria-pressed")).toBe("true");
    view.rerender(
      <HandCard
        card={LOFT}
        realCost={8}
        isPlayable
        state="markedToSell"
        isNew={false}
        isPending={false}
        onSelect={onSelect}
      />,
    );
    expect(card.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("stays new while selected or marked to sell", () => {
    const view = render(
      <HandCard
        card={LOFT}
        realCost={8}
        isPlayable
        state="selected"
        isNew
        isPending={false}
        onSelect={vi.fn()}
      />,
    );
    const description = "Number 24, real cost $8, new";
    expect(screen.getByRole("button", { name: "Loft", pressed: true, description })).toBeDefined();
    view.rerender(
      <HandCard
        card={LOFT}
        realCost={8}
        isPlayable
        state="markedToSell"
        isNew
        isPending={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Loft", pressed: true, description })).toBeDefined();
  });
});

describe("PlayedCard", () => {
  it("shows the card number and name and toggles selection", () => {
    const onSelect = vi.fn();
    render(<PlayedCard card={LOFT} isSelected={false} onSelect={onSelect} />);
    const card = screen.getByRole("button", { name: "Loft" });
    expect(card.textContent).toContain("#24");
    expect(card.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("BigCard", () => {
  it("shows the tier, the real cost and only the stats the card has", () => {
    render(<BigCard card={LOFT} realCost={11} />);
    const card = screen.getByRole("article", { name: "Loft" });
    expect(within(card).getByRole("img", { name: "Tier 2" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Cost 11" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Workforce 5" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Satisfaction 3" })).toBeDefined();
    expect(within(card).queryByRole("img", { name: /^Product/ })).toBeNull();
  });

  it("shows the card types as icons named after the type", () => {
    render(<BigCard card={LOFT} realCost={8} />);
    expect(screen.getByRole("img", { name: "Town Housing" })).toBeDefined();
    expect(screen.getByRole("img", { name: "City Housing" })).toBeDefined();
  });

  it("names every combo by type or card, including the ones that pay again each time", () => {
    render(<BigCard card={LOFT} realCost={8} />);
    const combos = screen.getAllByRole("group").map((combo) => combo.getAttribute("aria-label"));
    expect(combos).toEqual([
      "Combo: 1 Mercantile gives 1 satisfaction, again each time",
      "Combo: 1 Mass Transit gives 1 workforce",
      "Combo: Warehouse gives 1 satisfaction",
      "Combo: Fire Station gives 1 quality",
    ]);
  });
});
