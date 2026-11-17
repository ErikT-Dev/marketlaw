import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import { testPlayerIdOf } from "../../testing/testPlayerIdOf";
import { PlayersOnlinePanel } from "./PlayersOnlinePanel";

const PLAYERS: ReadonlyArray<PlayerOnlineView> = [
  { playerId: testPlayerIdOf(1), username: "Ann", rating: null, status: "in_game" },
  { playerId: testPlayerIdOf(2), username: "Bea", rating: 987, status: "online" },
  { playerId: testPlayerIdOf(3), username: "Quiet River Baron", rating: 1112, status: "in_game" },
];

describe("the players online panel", () => {
  it("shows the total count in its title", () => {
    render(<PlayersOnlinePanel players={PLAYERS} />);
    expect(screen.getByRole("heading", { name: "Players online · 3" })).toBeDefined();
  });

  it("lists the players in the order given with their rating and status", () => {
    render(<PlayersOnlinePanel players={PLAYERS} />);
    const rows = within(screen.getByRole("list", { name: "Players online" })).getAllByRole(
      "listitem",
    );
    expect(rows.map((row) => row.textContent)).toEqual([
      "Annin a game",
      "Bea987online",
      "Quiet River Baron1112in a game",
    ]);
  });

  it("links each username to the player's match history", () => {
    render(<PlayersOnlinePanel players={PLAYERS} />);
    const link = screen.getByRole("link", { name: "Bea" });
    expect(link.getAttribute("href")).toContain(testPlayerIdOf(2));
  });

  it("shows a count of zero and no players when nobody is online", () => {
    render(<PlayersOnlinePanel players={[]} />);
    expect(screen.getByRole("heading", { name: "Players online · 0" })).toBeDefined();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
