import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kind } from "../../../shared/catalogue/Kind";
import { Tier } from "../../../shared/catalogue/Tier";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { TradeName } from "../../../shared/TradeName";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";

const TRADE_REJECTIONS: Partial<Record<TradeName, ReasonCode>> = {
  influence_to_quality: "trade_limit_reached",
  influence_to_workforce: "cannot_afford_trade",
};

const SEAT: Partial<OwnSeatView> = {
  stats: {
    funds: 70,
    income: 30,
    influence: 4,
    workforce: 0,
    quality: 0,
    satisfaction: 0,
    product: 0,
    distribution: 0,
  },
  influenceUses: { influence_to_quality: 1 },
  buildPassPrice: 20,
  trades: TradeName.options.map((trade) => ({ trade, rejection: TRADE_REJECTIONS[trade] ?? null })),
  drawActions: Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({
      kind,
      tier,
      isAnyLeft: !(kind === "Service" && tier === 2),
      rejection: kind === "Service" && tier === 2 ? "no_card_of_kind" : null,
    })),
  ),
};

function showGame(changes: Partial<OwnSeatView> = SEAT) {
  const props = gamePageProps(roomUpdateWith({}, changes));
  render(<GamePage {...props} />);
  return props;
}

function openInfluence() {
  fireEvent.click(screen.getByRole("button", { name: "Use Influence 4" }));
  return screen.getByRole("dialog", { name: "Use Influence" });
}

describe("use influence", () => {
  it("shows each trade with its uses left, used, or what is missing", () => {
    showGame();
    const dialog = within(openInfluence());
    expect(textWithIconNames(dialog.getByText(/^You have/))).toBe(
      "You have [Influence 4] and [Funds 70]. [Influence] actions can be used any time in the main phase.",
    );
    const tiles = within(dialog.getByRole("list", { name: "Trades" }));
    expect(tiles.getAllByRole("button")).toHaveLength(20);
    const funds = tiles.getByRole("button", { name: "4 influence → 20 funds" });
    expect(funds).toHaveProperty("disabled", false);
    expect(textWithIconNames(funds)).toBe("[Influence 4] → [Funds 20]1 use left");
    expect(textWithIconNames(tiles.getByRole("button", { name: "4 influence → 1 quality" }))).toBe(
      "[Influence 4] → [Quality 1]used",
    );
    const workforce = tiles.getByRole("button", { name: "6 influence → 1 workforce" });
    expect(workforce).toHaveProperty("disabled", true);
    expect(textWithIconNames(workforce)).toBe("[Influence 6] → [Workforce 1]need [Influence 2]");
    expect(textWithIconNames(tiles.getByRole("button", { name: "3 influence → 10 funds" }))).toBe(
      "[Influence 3] → [Funds 10]unlimited uses",
    );
    expect(textWithIconNames(tiles.getByRole("button", { name: "10 funds → 1 influence" }))).toBe(
      "[Funds 10] → [Influence 1]unlimited uses",
    );
    expect(textWithIconNames(tiles.getByRole("button", { name: "20 funds → 1 build pass" }))).toBe(
      "[Funds 20] → [Build passes 1]unlimited uses",
    );
    expect(
      textWithIconNames(
        tiles.getByRole("button", {
          name: "2 influence + 1 distribution + 1 satisfaction → 1 product",
        }),
      ),
    ).toBe("[Influence 2] + [Distribution 1] + [Satisfaction 1] → [Product 1]1 use left");
  });

  it("colours a tile by its limit and by whether it can be taken now", () => {
    showGame();
    const tiles = within(within(openInfluence()).getByRole("list", { name: "Trades" }));
    const limitedReady = tiles.getByRole("button", { name: "4 influence → 20 funds" }).className;
    const limitedUsed = tiles.getByRole("button", { name: "4 influence → 1 quality" }).className;
    const unlimitedReady = tiles.getByRole("button", { name: "3 influence → 10 funds" }).className;
    expect(limitedReady).toContain("limited");
    expect(limitedReady).toContain("ready");
    expect(limitedUsed).toContain("limited");
    expect(limitedUsed).not.toContain("ready");
    expect(unlimitedReady).not.toContain("limited");
    expect(unlimitedReady).toContain("ready");
  });

  it("shows no stat as a word in the trades and the draw costs", () => {
    showGame();
    const dialog = within(openInfluence());
    const shown = [
      dialog.getByRole("list", { name: "Trades" }),
      ...dialog.getAllByRole("columnheader"),
    ]
      .map((element) => textWithIconNames(element).replace(/\[[^\]]*\]/g, ""))
      .join(" ");
    expect(shown).not.toMatch(
      /influence|fund|workforce|quality|satisfaction|product|distribution|build pass/i,
    );
  });

  it("sends a trade and keeps the pop-up open for the next one", () => {
    const { onAction } = showGame();
    const dialog = within(openInfluence());
    fireEvent.click(dialog.getByRole("button", { name: "4 influence → 20 funds" }));
    expect(onAction).toHaveBeenCalledWith({ type: "influence", trade: "influence_to_funds" });
    expect(screen.getByRole("dialog", { name: "Use Influence" })).toBeDefined();
  });

  it("shows the draw actions by kind and tier and sends the one chosen", () => {
    const { onAction } = showGame();
    const dialog = within(openInfluence());
    const table = within(dialog.getByRole("table", { name: "Draw actions" }));
    expect(table.getAllByRole("columnheader").map(textWithIconNames)).toEqual([
      "Kind",
      "Tier 1 · [Influence 3]",
      "Tier 2 · [Influence 4]",
      "Tier 3 · [Influence 5]",
    ]);
    const service = within(table.getByRole("row", { name: /^Service/ }));
    expect(service.getByText("None left")).toBeDefined();
    expect(
      service.getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Draw Service tier 1", "Draw Service tier 3"]);
    fireEvent.click(table.getByRole("button", { name: "Draw Public quality card tier 2" }));
    expect(onAction).toHaveBeenCalledWith({
      type: "draw_action",
      kind: "Public quality card",
      tier: 2,
    });
  });

  it("shows each kind name of the draw table on its sector colour", () => {
    showGame();
    const table = within(within(openInfluence()).getByRole("table", { name: "Draw actions" }));
    expect(
      table.getAllByRole("rowheader").map((cell) => [cell.textContent, cell.style.background]),
    ).toEqual([
      ["Residential", "var(--color-sector-residential-solid)"],
      ["Industry", "var(--color-sector-industry-solid)"],
      ["Service", "var(--color-sector-service-solid)"],
      ["Public quality card", "var(--color-sector-public-solid)"],
      ["Public satisfaction card", "var(--color-sector-public-solid)"],
    ]);
  });

  it("shows None left for a kind and tier not left even when every action is disabled", () => {
    showGame({
      ...SEAT,
      drawActions: (SEAT.drawActions ?? []).map((status) => ({
        ...status,
        rejection: "action_limit_reached",
      })),
    });
    const table = within(within(openInfluence()).getByRole("table", { name: "Draw actions" }));
    const service = within(table.getByRole("row", { name: /^Service/ }));
    expect(service.getByText("None left")).toBeDefined();
    expect(
      service.getAllByRole("button").map((button) => button.getAttribute("disabled") !== null),
    ).toEqual([true, true]);
  });
});

describe("undo", () => {
  it("is offered only when the room would accept it", () => {
    showGame({ ...SEAT, undoRejection: "cannot_undo" });
    expect(screen.getByRole("button", { name: "Undo" })).toHaveProperty("disabled", true);
  });

  it("sends undo", () => {
    const { onAction } = showGame({ ...SEAT, undoRejection: null });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledWith({ type: "undo" });
  });
});
