import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { statAndTypeWordsShownIn } from "../../testing/statAndTypeWordsShownIn";
import { CardSetPage } from "./CardSetPage";
import { cardSetPageOf } from "./cardSetPageOf";

function showCardDetail() {
  render(<CardSetPage openCard="Repetitive Housing" gameClock={null} />);
  return screen.getByRole("dialog", { name: "#23 Repetitive Housing" });
}

const FIELDS = ["Sector and tier", "Base cost", "Gives", "Uses up", "Types", "Combos"];

function factOf(detail: HTMLElement, field: string): HTMLElement {
  const value = within(detail).getAllByRole("definition")[FIELDS.indexOf(field)];
  if (value === undefined) {
    throw new Error(`no value for ${field}`);
  }
  return value;
}

afterEach(() => {
  window.location.hash = "";
});

describe("card detail", () => {
  it("opens a card from its tile by its own link", () => {
    render(<CardSetPage openCard={null} gameClock={null} />);
    const grid = screen.getByRole("list", { name: "Cards" });
    fireEvent.click(within(grid).getByRole("button", { name: "Repetitive Housing" }));
    expect(cardSetPageOf(window.location.hash)).toEqual({ openCard: "Repetitive Housing" });
  });

  it("tells the reader that a card can be opened", () => {
    render(<CardSetPage openCard={null} gameClock={null} />);
    expect(screen.getByText(/click a card to see everything about it/)).toBeTruthy();
  });

  it("shows the big card, sector, tier, base cost and what the card gives and uses up", () => {
    const detail = showCardDetail();
    expect(within(detail).getByRole("article", { name: "Repetitive Housing" })).toBeTruthy();
    expect(
      within(detail)
        .getAllByRole("term")
        .map((term) => term.textContent),
    ).toEqual(FIELDS);
    expect(factOf(detail, "Sector and tier").textContent).toBe("Residential · tier 2");
    expect(within(factOf(detail, "Base cost")).getByRole("img", { name: "Cost 90" })).toBeTruthy();
    expect(
      within(factOf(detail, "Gives"))
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Workforce +4"]);
    expect(
      within(factOf(detail, "Uses up"))
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Quality −3", "Satisfaction −2"]);
  });

  it("shows a type counted twice as its icon twice", () => {
    const types = factOf(showCardDetail(), "Types");
    expect(
      within(types)
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Town Housing", "Low Wealth", "Low Wealth"]);
  });

  it("lists every combo with type combos first and card-name combos by card name and marks the infinite one", () => {
    const combos = within(factOf(showCardDetail(), "Combos")).getAllByRole("listitem");
    expect(
      combos.map((combo) => within(combo).getByRole("group").getAttribute("aria-label")),
    ).toEqual([
      "Combo: 1 Retail gives 1 workforce, again each time",
      "Combo: Fish Market and Trade gives 1 quality",
      "Combo: Real Estate Agency gives 1 quality",
      "Combo: Recycling Center gives 1 quality",
    ]);
    expect(combos[0]?.textContent).toContain("infinite");
    expect(combos[2]?.textContent).toContain("Real Estate Agency in your city");
  });

  it("shows stats and types only as icons", () => {
    const detail = showCardDetail();
    expect(statAndTypeWordsShownIn(factOf(detail, "Gives"))).toEqual([]);
    expect(statAndTypeWordsShownIn(factOf(detail, "Types"))).toEqual([]);
    expect(statAndTypeWordsShownIn(factOf(detail, "Combos"))).toEqual([]);
  });
});

describe("card set address", () => {
  it("reads the grid, a card and an unknown card from the link", () => {
    expect(cardSetPageOf("#card-set")).toEqual({ openCard: null });
    expect(cardSetPageOf("#card-set/Repetitive%20Housing")).toEqual({
      openCard: "Repetitive Housing",
    });
    expect(cardSetPageOf("#card-set/No%20Such%20Card")).toEqual({ openCard: null });
    expect(cardSetPageOf("#card-set/%E0%A4%A")).toEqual({ openCard: null });
    expect(cardSetPageOf("#rules")).toBeNull();
  });
});
