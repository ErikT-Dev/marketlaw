import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kind } from "../../../shared/catalogue/Kind";
import { Tier } from "../../../shared/catalogue/Tier";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { TradeName } from "../../../shared/TradeName";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const TRADE_REJECTIONS: Partial<Record<TradeName, ReasonCode>> = {
  influence_to_quality: "trade_limit_reached",
  influence_to_workforce: "cannot_afford_trade",
  skip_build: "skip_build_after_play",
};

const SEAT: Partial<OwnSeatView> = {
  stats: {
    funds: 7,
    income: 3,
    influence: 4,
    workforce: 0,
    quality: 0,
    satisfaction: 0,
    product: 0,
    distribution: 0,
    bonus: 0,
  },
  influenceUses: { influence_to_quality: 1 },
  buildPassPrice: 3,
  trades: TradeName.options.map((trade) => ({ trade, rejection: TRADE_REJECTIONS[trade] ?? null })),
  drawActions: Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({
      kind,
      tier,
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
  fireEvent.click(screen.getByRole("button", { name: "Use influence" }));
  return screen.getByRole("dialog", { name: "Use influence" });
}

describe("use influence", () => {
  it("shows each trade with its uses left, used, or what is missing", () => {
    showGame();
    const dialog = within(openInfluence());
    expect(
      dialog.getByText(
        "You have 4 influence and 7 funds. Influence actions can be used any time in the main phase.",
      ),
    ).toBeDefined();
    const tiles = within(dialog.getByRole("list", { name: "Trades" }));
    expect(tiles.getAllByRole("button")).toHaveLength(20);
    const funds = tiles.getByRole("button", { name: "4 influence → 2 funds" });
    expect(funds).toHaveProperty("disabled", false);
    expect(funds.textContent).toBe("4 influence → 2 funds1 use left");
    expect(tiles.getByRole("button", { name: "4 influence → 1 quality" }).textContent).toBe(
      "4 influence → 1 qualityused",
    );
    const workforce = tiles.getByRole("button", { name: "6 influence → 1 workforce" });
    expect(workforce).toHaveProperty("disabled", true);
    expect(workforce.textContent).toBe("6 influence → 1 workforceneed 2 influence");
    expect(tiles.getByRole("button", { name: "1 fund → 1 influence" }).textContent).toBe(
      "1 fund → 1 influenceunlimited",
    );
    expect(tiles.getByRole("button", { name: "3 funds → 1 build pass" })).toBeDefined();
    expect(tiles.getByRole("button", { name: "Skip build → 1 build pass" }).textContent).toBe(
      "Skip build → 1 build passYou can only skip build before playing a card.",
    );
    expect(
      tiles.getByRole("button", {
        name: "2 influence + 1 distribution + 1 satisfaction → 1 product",
      }),
    ).toBeDefined();
  });

  it("sends a trade and keeps the pop-up open for the next one", () => {
    const { onAction } = showGame();
    const dialog = within(openInfluence());
    fireEvent.click(dialog.getByRole("button", { name: "4 influence → 2 funds" }));
    expect(onAction).toHaveBeenCalledWith({ type: "influence", trade: "influence_to_funds" });
    expect(screen.getByRole("dialog", { name: "Use influence" })).toBeDefined();
  });

  it("shows the draw actions by kind and tier and sends the one chosen", () => {
    const { onAction } = showGame();
    const dialog = within(openInfluence());
    const table = within(dialog.getByRole("table", { name: "Draw actions" }));
    expect(table.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Kind",
      "Tier 1 · 3 influence",
      "Tier 2 · 4 influence",
      "Tier 3 · 5 influence",
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
