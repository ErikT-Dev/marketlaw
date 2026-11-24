import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RulesPage } from "./RulesPage";
import { rulesPageOf } from "./rulesPageOf";

function shownSection(anchor: string): HTMLElement {
  const hash = `#rules/${anchor}`;
  window.history.replaceState(null, "", `/${hash}`);
  const address = rulesPageOf(hash);
  if (address === null) {
    throw new Error(`not a rules hash: ${hash}`);
  }
  render(<RulesPage address={address} gameClock={null} />);
  return within(screen.getByRole("dialog", { name: "Rules" })).getByRole("article");
}

function flatText(element: Element): string {
  return element.textContent.replace(/\s+/g, " ");
}

function iconNamesIn(element: HTMLElement): ReadonlyArray<string> {
  return within(element)
    .queryAllByRole("img")
    .map((icon) => icon.getAttribute("aria-label") ?? icon.getAttribute("alt") ?? "");
}

function bodyRowsOf(article: HTMLElement): ReadonlyArray<HTMLElement> {
  return [...article.querySelectorAll<HTMLElement>("tbody tr")];
}

function rowTexts(article: HTMLElement): ReadonlyArray<string> {
  return bodyRowsOf(article).map(flatText);
}

function scoreFormulaOf(article: HTMLElement): HTMLElement {
  return within(article).getByText((content, element) => element?.tagName === "PRE" && content.trim() === "");
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("rulebook sections changed by the 2026-11-20 notes", () => {
  it("names the end goal of income 20 and all 3 projects in the goal", () => {
    const article = shownSection("the-goal");
    expect(flatText(article)).toContain("of at least 20 and all 3 projects completed");
    expect(iconNamesIn(article)).toContain("Income");
  });

  it("lists the stats without a bonus stat and explains funds in tenths and F", () => {
    const article = shownSection("your-stats");
    const rows = bodyRowsOf(article);
    expect(rows).toHaveLength(8);
    expect(rows.map((row) => iconNamesIn(within(row).getAllByRole("cell")[0] ?? row)[0])).toEqual([
      "Funds",
      "Income",
      "Influence",
      "Workforce",
      "Quality",
      "Satisfaction",
      "Product",
      "Distribution",
    ]);
    expect(flatText(article)).not.toMatch(/bonus/i);
    expect(flatText(article)).toContain("in tenths, so you may have 5.3");
    expect(flatText(article)).toContain("Total worth gained (F):");
    expect(flatText(article)).toContain("It starts at 14 and only goes up.");
  });

  it("shows the stats gain formula and Support", () => {
    const article = shownSection("stats-gain-and-support");
    expect(within(article).getByRole("heading", { level: 2 }).textContent).toContain(
      "Stats gain and Support",
    );
    expect(flatText(article)).toContain(
      "Workforce + Quality + Satisfaction + 4 × Product + 3 × Distribution",
    );
    expect(iconNamesIn(article)).toEqual(expect.arrayContaining(["Product", "Distribution"]));
    expect(flatText(article)).toContain("a stats gain of 23 is +2.3");
    expect(flatText(article)).toContain("for every full 10 they are behind");
    expect(flatText(article)).toContain("23.5 behind gives +2");
  });

  it("shows the projects with their needs, the income gate and the same reward for everyone", () => {
    const article = shownSection("projects");
    expect(rowTexts(article)).toEqual([
      "Clean up the streets8 Quality",
      "Culture campaign8 Satisfaction",
      "Help the homeless8 Workforce",
    ]);
    expect(flatText(article)).toContain("at least 10 Income");
    expect(flatText(article)).toContain("gives +1 Income, +2 Funds and +3 Influence, and draws 1 card, every time");
  });

  it("shows the quests table rules with the extra turn, being first and the times by tier", () => {
    const text = flatText(shownSection("quests"));
    expect(text).toContain("4 quests (5 from turn 20)");
    expect(text).toContain("tier 2 quests can appear from turn 5, tier 3 from turn 13");
    expect(text).toContain("Be first:");
    expect(text).toContain("extra turn");
    expect(text).toContain("A tier 1 quest stays at most 6 turns, a tier 2 quest 5 and a tier 3 quest 4.");
  });

  it("shows the end of the game, the score formula and the places", () => {
    const article = shownSection("the-end-of-the-game");
    const text = flatText(article);
    expect(text).toContain("That turn's end-of-turn payouts are skipped.");
    expect(text).toContain("after turn 40's main phase");
    expect(text).toContain("Only whole Funds count: 5.9 Funds count as 5.");
    expect(text).toContain("every player who reached the end goal places above every player who did not");
    expect(text).toContain("the higher total worth gained (F) places higher");
    const formula = scoreFormulaOf(article);
    expect(flatText(formula)).toContain("6.5 × Income+ 0.7 × Workforce+ 0.55 × Quality+ 0.5 × Satisfaction+ 2.75 × Product+ 2.25 × Distribution+ 0.2 × (whole Funds + cards in hand)+ bonus-type points");
    expect(iconNamesIn(formula)).toEqual([
      "Income",
      "Workforce",
      "Quality",
      "Satisfaction",
      "Product",
      "Distribution",
      "Funds",
    ]);
  });
});
