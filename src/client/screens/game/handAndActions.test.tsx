import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PendingAction } from "../../store/PendingAction";
import type { RejectedMove } from "../../store/RejectedMove";
import { gamePageProps } from "../../testing/gamePageProps";
import { photoLoaderThatDecodes } from "../../testing/photoLoaderThatDecodes";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import { PhotoLoading } from "./PhotoLoading";

const HAND: Partial<OwnSeatView> = {
  hand: ["Farm House", "Log House", "Loft"],
  handDetails: [
    { card: "Farm House", realCost: 6, sameSectorAndTierInCity: 2, playRejection: null },
    { card: "Log House", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
    { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
  ],
};

function showGame(
  ownChanges: Partial<OwnSeatView> = {},
  pendingActions: ReadonlyArray<PendingAction> = [],
  rejectedMove: RejectedMove | null = null,
) {
  const props = gamePageProps(
    roomUpdateWith({}, { ...HAND, ...ownChanges }),
    pendingActions,
    rejectedMove,
  );
  render(
    <PhotoLoading value={photoLoaderThatDecodes(() => true)}>
      <GamePage {...props} />
    </PhotoLoading>,
  );
  return props;
}

async function photosDecoded() {
  await act(async () => Promise.resolve());
}

function handCard(name: string) {
  return within(screen.getByRole("list", { name: "Your hand" })).getByRole("button", { name });
}

describe("hand", () => {
  it("shows each card with its real cost and marks the ones that cannot be played", () => {
    showGame();
    expect(handCard("Farm House").textContent).toContain("$6");
    expect(
      screen.getByRole("button", { name: "Loft", description: /cannot be played/ }),
    ).toBeDefined();
  });
});

describe("big card", () => {
  it("explains the real cost and plays the selected card", async () => {
    const { onAction } = showGame();
    await photosDecoded();
    fireEvent.click(handCard("Farm House"));
    const selected = screen.getByRole("region", { name: "Selected card: Farm House" });
    expect(within(selected).getByText("Costs 6 funds")).toBeDefined();
    expect(
      within(selected).getByText(
        "Base cost 4, plus 2 for the 2 Residential tier 1 cards already in your city.",
      ),
    ).toBeDefined();
    fireEvent.click(within(selected).getByRole("button", { name: "Play card" }));
    expect(onAction).toHaveBeenCalledWith({ type: "play_card", card: "Farm House" });
    expect(screen.queryByRole("region", { name: /^Selected card/ })).toBeNull();
  });

  it("says why a card cannot be played and does not let it be played", async () => {
    showGame();
    await photosDecoded();
    fireEvent.click(handCard("Loft"));
    const selected = screen.getByRole("region", { name: "Selected card: Loft" });
    expect(
      within(selected).getByText("Tier 2 and 3 cards can be played from turn 5."),
    ).toBeDefined();
    expect(within(selected).getByRole("button", { name: "Play card" })).toHaveProperty(
      "disabled",
      true,
    );
    fireEvent.click(within(selected).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: /^Selected card/ })).toBeNull();
  });
});

describe("actions", () => {
  it("sells the cards marked in sell mode in one action", () => {
    const { onAction } = showGame();
    fireEvent.click(screen.getByRole("button", { name: "Sell cards" }));
    fireEvent.click(handCard("Farm House"));
    fireEvent.click(handCard("Loft"));
    expect(screen.getByText(/then Sell 2 cards for 2 funds/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Sell 2 cards" }));
    expect(onAction).toHaveBeenCalledWith({ type: "sell", cards: ["Farm House", "Loft"] });
  });

  it("always lets the player leave sell mode", () => {
    showGame();
    fireEvent.click(screen.getByRole("button", { name: "Sell cards" }));
    expect(screen.getByRole("button", { name: "Cancel selling" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("leaves sell mode without selling when nothing is marked", () => {
    const { onAction } = showGame();
    fireEvent.click(screen.getByRole("button", { name: "Sell cards" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel selling" }));
    expect(screen.getByRole("button", { name: "Sell cards" })).toBeDefined();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("ends the turn", () => {
    const { onAction } = showGame();
    fireEvent.click(screen.getByRole("button", { name: "End turn" }));
    expect(onAction).toHaveBeenCalledWith({ type: "end_turn" });
  });

  it("disables everything but End turn at the action limit and says why", async () => {
    showGame({
      sellRejection: "action_limit_reached",
      handDetails: [
        {
          card: "Farm House",
          realCost: 4,
          sameSectorAndTierInCity: 0,
          playRejection: "action_limit_reached",
        },
      ],
    });
    await photosDecoded();
    fireEvent.click(handCard("Farm House"));
    const selected = screen.getByRole("region", { name: "Selected card: Farm House" });
    expect(within(selected).getByRole("button", { name: "Play card" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(
      within(screen.getByRole("region", { name: "Actions" })).getByText(
        "You have used all 50 actions this turn. You can still end your turn.",
      ),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Sell cards" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "End turn" })).toHaveProperty("disabled", false);
  });

  it("says you are done and which players the turn waits for", () => {
    showGame({ isDone: true });
    const status = screen.getByRole("status", { name: "" });
    expect(status.textContent).toContain("You are done for this turn");
    expect(status.textContent).toContain("Waiting for Di.");
    expect(screen.queryByRole("button", { name: "End turn" })).toBeNull();
  });
});

describe("pending and rejected moves", () => {
  it("shows a card being played as waiting for the server and blocks other moves", () => {
    showGame({}, [{ id: "a1", action: { type: "play_card", card: "Log House" } }]);
    expect(handCard("Log House")).toHaveProperty("disabled", true);
    expect(within(handCard("Log House")).getByRole("status").textContent).toBe(
      "Waiting for the server…",
    );
    expect(screen.getByRole("button", { name: "End turn" })).toHaveProperty("disabled", true);
  });

  it("shows a pending end of turn on its button", () => {
    showGame({}, [{ id: "a2", action: { type: "end_turn" } }]);
    expect(screen.getByRole("button", { name: "Waiting for the server…" })).toBeDefined();
  });

  it("shows the reason for a rejected move with the real numbers", () => {
    const { onDismissRejection } = showGame({}, [], {
      action: { type: "play_card", card: "Farm House" },
      code: "not_enough_funds",
    });
    expect(screen.getByRole("alert").textContent).toContain("You need 6 funds; you have 7.");
    fireEvent.click(screen.getByRole("button", { name: "Close: Move rejected" }));
    expect(onDismissRejection).toHaveBeenCalledTimes(1);
  });
});
