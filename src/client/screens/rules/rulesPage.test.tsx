import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { statAndTypeWordsShownIn } from "../../testing/statAndTypeWordsShownIn";
import { runningGameClockOf } from "../game/runningGameClockOf";
import { PARSED_RULEBOOK } from "./PARSED_RULEBOOK";
import { RulesPage } from "./RulesPage";
import { rulesPageOf } from "./rulesPageOf";

const NOW = 5_000_000;

function showRules(hash: string, gameClock: Parameters<typeof RulesPage>[0]["gameClock"] = null) {
  window.history.replaceState(null, "", `/${hash}`);
  const address = rulesPageOf(hash);
  if (address === null) {
    throw new Error(`not a rules hash: ${hash}`);
  }
  const { unmount } = render(<RulesPage address={address} gameClock={gameClock} />);
  return { rules: screen.getByRole("dialog", { name: "Rules" }), unmount };
}

function sectionText(rules: HTMLElement): HTMLElement {
  return within(rules).getByRole("article");
}

function proseOf(article: HTMLElement): ReadonlyArray<Element> {
  return [...article.querySelectorAll("p, li, th, td, pre")];
}

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("rules viewer", () => {
  it("lists all 21 sections in the contents and opens the first section by default", () => {
    const { rules } = showRules("#rules");
    const contents = within(rules).getByRole("navigation", { name: "Contents" });
    const entries = within(contents).getAllByRole("link");
    expect(entries).toHaveLength(21);
    expect(entries[0]?.textContent).toContain("The goal");
    expect(entries[0]?.getAttribute("aria-current")).toBe("page");
    expect(within(sectionText(rules)).getByRole("heading", { level: 2 }).textContent).toContain("The goal");
    expect(sectionText(rules).textContent).toContain("You are the mayor of a new city.");
  });

  it("shows the section named in the link with its see also links", () => {
    const { rules } = showRules("#rules/time");
    const article = sectionText(rules);
    expect(within(article).getByRole("heading", { level: 2 }).textContent).toContain("Time");
    const time = PARSED_RULEBOOK.sections.find(
      (section) => section.anchor === "time",
    );
    const seeAlso = within(article).getByRole("group", { name: "See also" });
    expect(within(seeAlso).getAllByRole("link").map((link) => link.textContent)).toEqual(
      time?.related.map((related) => related.title),
    );
  });

  it("opens a linked section in place of the current one", () => {
    const { rules } = showRules("#rules/the-goal");
    const [textLink] = within(sectionText(rules)).getAllByRole("link", { name: "The end of the game" });
    if (textLink === undefined) {
      throw new Error("no link");
    }
    fireEvent.click(textLink);
    expect(window.location.hash).toBe("#rules/the-end-of-the-game");
  });

  it("offers only next on the first section and only previous on the last", () => {
    const { rules: first, unmount } = showRules("#rules/the-goal");
    expect(within(first).queryByRole("button", { name: /^Previous/ })).toBeNull();
    fireEvent.click(within(first).getByRole("button", { name: "Next: Your stats" }));
    expect(window.location.hash).toBe("#rules/your-stats");
    unmount();

    const { rules: last } = showRules("#rules/the-end-of-the-game");
    expect(within(last).queryByRole("button", { name: /^Next/ })).toBeNull();
    fireEvent.click(within(last).getByRole("button", { name: "Previous: The quest list" }));
    expect(window.location.hash).toBe("#rules/the-quest-list");
  });

  it("shows stats and types in the text as icons with their names", () => {
    const { rules, unmount } = showRules("#rules/income");
    expect(within(sectionText(rules)).getAllByRole("img", { name: "Income" }).length).toBeGreaterThan(
      0,
    );
    unmount();
    const cards = showRules("#rules/the-cards");
    expect(within(sectionText(cards.rules)).getAllByRole("img", { name: "Farm" }).length).toBeGreaterThan(0);
    cards.unmount();
    PARSED_RULEBOOK.sections.forEach((section) => {
      const shown = showRules(`#rules/${section.anchor}`);
      const article = sectionText(shown.rules);
      const words = proseOf(article).flatMap((element) => statAndTypeWordsShownIn(element));
      expect({ section: section.title, words }).toEqual({ section: section.title, words: [] });
      shown.unmount();
    });
  });

  it("says the clock keeps running and shows the time left when opened during a game", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const update = roomUpdateWith(
      {},
      {
        timeBankMs: 600_000,
        clock: {
          bankMs: 600_000,
          freeUntil: v.parse(EpochMs, NOW + 30_000),
          deadline: v.parse(EpochMs, NOW + 90_000),
        },
      },
    );
    const { rules } = showRules("#rules", runningGameClockOf(update, 0));
    const note = within(rules).getByRole("note");
    expect(note.textContent).toContain("Your clock keeps running while the rules are open.");
    expect(within(note).getByRole("timer", { name: "Time left 1:30" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(within(note).getByRole("timer", { name: "Time left 1:20" })).toBeTruthy();
  });

  it("shows no clock line outside a game", () => {
    expect(within(showRules("#rules").rules).queryByRole("note")).toBeNull();
  });
});
