import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function withAway(update: RoomUpdate): RoomUpdate {
  return update.game === null ? update : { ...update, game: { ...update.game, awaySeats: [3] } };
}

describe("connections in a game", () => {
  it("shows a disconnected player as away to the others", () => {
    render(<GamePage {...gamePageProps(withAway(roomUpdateWith({})))} />);
    const order = screen.getByRole("list", { name: "Player order" });
    const badges = within(order)
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(badges.find((badge) => badge.startsWith("Cy"))).toContain("away");
    expect(screen.getByRole("article", { name: "Cy" }).textContent).toContain("away");
  });

  it("says who gets free time again when the game goes on after a pause", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(
      <GamePage
        {...props}
        timeOutNotice={{ kind: "resumed", seats: [{ seat: 3, freeMs: 75_000 }] }}
      />,
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Everyone was away, so the game was paused. Cy gets 75 seconds of free time before their time runs out.",
    );
  });

  it("says each player's own free time when a pause caught a market go and a main phase", () => {
    const props = gamePageProps(roomUpdateWith({}));
    const seats = [
      { seat: 2, freeMs: 75_000 },
      { seat: 1, freeMs: 5_000 },
      { seat: 3, freeMs: 75_000 },
    ] as const;
    render(<GamePage {...props} timeOutNotice={{ kind: "resumed", seats }} />);
    expect(screen.getByRole("status").textContent).toContain(
      "You get 75 seconds of free time before your time runs out. Ann gets 5 seconds of free time before their time runs out. Cy gets 75 seconds of free time before their time runs out.",
    );
  });

  it("offers to play in this tab when the game was opened in another one", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(<GamePage {...props} connection="opened_elsewhere" />);
    const dialog = screen.getByRole("dialog", { name: "This game is open in another tab" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Play here instead" }));
    expect(props.onPlayHere).toHaveBeenCalledTimes(1);
  });

  it("says the connection was lost while reconnecting", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} connection="connecting" />);
    expect(screen.getByRole("status").textContent).toContain("Connection lost. Reconnecting…");
  });

  it("asks to reload when a new version is available", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} isOutdated />);
    const dialog = screen.getByRole("dialog", { name: "A new version is available" });
    expect(within(dialog).getByRole("button", { name: "Reload" })).toBeTruthy();
  });
});
