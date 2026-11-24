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

describe("card tile pictures", () => {
  it("shows a small decorative picture of the card on hand and city tiles", () => {
    render(
      <>
        <HandCard
          card={LOFT}
          realCost={8}
          isPlayable
          state="default"
          isNew={false}
          isPending={false}
          onSelect={vi.fn()}
        />
        <PlayedCard card={LOFT} isSelected={false} onSelect={vi.fn()} />
      </>,
    );
    const pictures = screen.getAllByRole("presentation", { hidden: true });
    expect(pictures.map((picture) => picture.getAttribute("src"))).toEqual([
      expect.stringMatching(/card-tiles\/[^/]+\.webp$/),
      expect.stringMatching(/card-tiles\/[^/]+\.webp$/),
    ]);
    expect(pictures.map((picture) => picture.getAttribute("alt"))).toEqual(["", ""]);
    expect(screen.queryAllByRole("img")).toEqual([]);
    expect(screen.queryAllByRole("presentation")).toEqual([]);
  });
});

describe("BigCard", () => {
  it("shows the tier, the real cost and only the stats the card has, signed by what it gives and uses up", () => {
    render(<BigCard card={LOFT} realCost={11} />);
    const card = screen.getByRole("article", { name: "Loft" });
    expect(within(card).getByRole("img", { name: "Tier 2" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Cost 11" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Workforce +5" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Satisfaction −3" })).toBeDefined();
    expect(within(card).queryByRole("img", { name: /^Product/ })).toBeNull();
  });

  it("shows the card types as icons named after the type", () => {
    render(<BigCard card={LOFT} realCost={8} />);
    expect(screen.getByRole("img", { name: "Town Housing" })).toBeDefined();
    expect(screen.getByRole("img", { name: "City Housing" })).toBeDefined();
  });

  it("names every combo by type or card in sorted order, including the ones that pay again each time", () => {
    render(<BigCard card={LOFT} realCost={8} />);
    const combos = screen.getAllByRole("group").map((combo) => combo.getAttribute("aria-label"));
    expect(combos).toEqual([
      "Combo: 1 Mercantile gives 1 satisfaction, again each time",
      "Combo: 1 Mass Transit gives 1 workforce",
      "Combo: Fire Station gives 1 quality",
      "Combo: Warehouse gives 1 satisfaction",
    ]);
  });

  it("signs a public card's quality as given and its workforce as used up", () => {
    render(<BigCard card={cardOf("Landfill")} realCost={6} />);
    expect(screen.getByRole("img", { name: "Quality +3" })).toBeDefined();
    expect(screen.getByRole("img", { name: "Workforce −1" })).toBeDefined();
  });

  it("shows the title bar on the see-through bar colour of the card's sector", () => {
    const titleBars = (
      ["Farm House", "Timber Harvesting Industry", "Fast Food Restaurant", "Landfill"] as const
    ).map((name) => {
      const { unmount } = render(<BigCard card={cardOf(name)} realCost={1} />);
      const titleBar = screen.getByText(name);
      const colours = [titleBar.style.background, titleBar.style.color];
      unmount();
      return colours;
    });
    expect(titleBars).toEqual([
      ["var(--color-sector-residential-bar)", "var(--color-sector-residential-solid-text)"],
      ["var(--color-sector-industry-bar)", "var(--color-sector-industry-solid-text)"],
      ["var(--color-sector-service-bar)", "var(--color-sector-service-solid-text)"],
      ["var(--color-sector-public-bar)", "var(--color-sector-public-solid-text)"],
    ]);
  });
});
