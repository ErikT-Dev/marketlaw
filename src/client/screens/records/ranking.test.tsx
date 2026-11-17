import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlayerId } from "../../../shared/PlayerId";
import { RecordsPage } from "./RecordsPage";

const ANN = v.parse(PlayerId, "0f4c2a5e-1b7d-4e3a-9c8f-2d6b1a0e5f71");
const BEA = v.parse(PlayerId, "6a1e9d3c-7b2f-4c8e-a5d4-3f0b8e2c1d92");

type Standing = { readonly kind: string; readonly place?: number };

function rankingAnswer(page: number, standing: Standing) {
  return {
    page,
    pageCount: 3,
    entries: [
      { place: page * 50 - 49, playerId: BEA, username: "Bea", rating: 1052, rankedGames: 40 },
      { place: page * 50 - 48, playerId: ANN, username: "Ann", rating: 1049, rankedGames: 38 },
    ],
    standing,
  };
}

function rankingServer(answerTo: (page: unknown) => unknown) {
  const requests: Array<unknown> = [];
  vi.stubGlobal("fetch", async (path: string, init: { readonly body: string }) => {
    const request: unknown = JSON.parse(init.body);
    requests.push({ path, request });
    const hasPage = typeof request === "object" && request !== null && "page" in request;
    return Promise.resolve(Response.json(hasPage ? answerTo(request.page) : null));
  });
  return requests;
}

function renderRanking(token: string | null) {
  render(<RecordsPage page={{ kind: "ranking" }} viewerId={null} token={token} />);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ELO ranking page", () => {
  it("opens at page 1 with places, usernames that open match histories, ratings and games", async () => {
    const requests = rankingServer(() => rankingAnswer(1, { kind: "placed", place: 2 }));
    renderRanking("ann-token");
    const page = await screen.findByRole("dialog", { name: "ELO ranking" });
    const table = await within(page).findByRole("table", { name: "Ranking" });
    expect(requests).toEqual([{ path: "/api/ranking", request: { token: "ann-token", page: 1 } }]);
    expect(
      within(page).getByText(
        "Every registered player with at least 1 ranked game, highest rating first. Equal ratings: more ranked games first, then by username.",
      ),
    ).toBeTruthy();
    expect(within(page).getByText("Page 1 of 3 · places 1–2")).toBeTruthy();
    const rows = within(table).getAllByRole("row");
    expect(rows.map((row) => row.textContent)).toEqual([
      "PlaceUsernameRatingRanked games",
      "1Bea105240",
      "2Ann104938",
    ]);
    expect(within(table).getByRole("link", { name: "Bea" }).getAttribute("href")).toBe(
      `#history/${BEA}`,
    );
    expect(rows[2]?.getAttribute("aria-current")).toBe("true");
    expect(rows[1]?.getAttribute("aria-current")).toBeNull();
    expect(screen.getByRole("button", { name: "‹ Previous" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Jump to me" })).toHaveProperty("disabled", false);
  });

  it("pages forward and back and jumps to the page holding the own place", async () => {
    const requests = rankingServer((page) =>
      rankingAnswer(page === "mine" ? 3 : Number(page), { kind: "placed", place: 102 }),
    );
    renderRanking("ann-token");
    fireEvent.click(await screen.findByRole("button", { name: "Next ›" }));
    expect(await screen.findByText("Page 2 of 3 · places 51–52")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "‹ Previous" }));
    expect(await screen.findByText("Page 1 of 3 · places 1–2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Jump to me" }));
    expect(await screen.findByText("Page 3 of 3 · places 101–102")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next ›" })).toHaveProperty("disabled", true);
    const ownRow = screen.getByRole("row", { name: /^102/ });
    expect(ownRow.getAttribute("aria-current")).toBe("true");
    expect(requests.map((sent) => sent)).toEqual(
      [1, 2, 1, "mine"].map((page) => ({
        path: "/api/ranking",
        request: { token: "ann-token", page },
      })),
    );
  });

  it.each([
    [null, "logged_out", "Log in to find your place in the ranking."],
    [
      "guest-token",
      "guest",
      "You are not in the ranking: it lists registered players who have played at least 1 ranked game. Sign up to play ranked games.",
    ],
    [
      "new-token",
      "no_ranked_game",
      "You are not in the ranking yet: it lists registered players who have played at least 1 ranked game. Join the ranked queue from the lobby.",
    ],
  ])(
    "tells a viewer with token %s who is %s why they are not in the table",
    async (token, kind, text) => {
      const requests = rankingServer(() => rankingAnswer(1, { kind }));
      renderRanking(token);
      expect(await screen.findByText(text)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Jump to me" })).toHaveProperty("disabled", true);
      expect(screen.queryByRole("row", { current: true })).toBeNull();
      expect(requests).toEqual([{ path: "/api/ranking", request: { token, page: 1 } }]);
    },
  );

  it("says when nobody is in the ranking yet", async () => {
    rankingServer(() => ({ page: 1, pageCount: 1, entries: [], standing: { kind: "logged_out" } }));
    renderRanking(null);
    expect(await screen.findByText("Nobody is in the ranking yet.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(/^Page /)).toBeNull();
    expect(screen.getByRole("button", { name: "Next ›" })).toHaveProperty("disabled", true);
  });

  it("says when the ranking could not be loaded", async () => {
    rankingServer(() => null);
    renderRanking("ann-token");
    expect(
      await screen.findByText("The ranking could not be loaded. Try again later."),
    ).toBeTruthy();
  });
});
