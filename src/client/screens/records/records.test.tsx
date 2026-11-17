import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameId } from "../../../shared/GameId";
import { PlayerId } from "../../../shared/PlayerId";
import { RecordsPage } from "./RecordsPage";

const ANN = v.parse(PlayerId, "0f4c2a5e-1b7d-4e3a-9c8f-2d6b1a0e5f71");
const BEA = v.parse(PlayerId, "6a1e9d3c-7b2f-4c8e-a5d4-3f0b8e2c1d92");
const NEWER_GAME = v.parse(GameId, "9b3d7e1a-5c2f-4a8b-b6e0-1d4c7f2a9e83");
const OLDER_GAME = v.parse(GameId, "2c8f4b6d-0e1a-4d7c-8b3e-5a9f1c6d2e04");
const OCTOBER_25 = Date.UTC(2026, 9, 25, 12);
const OCTOBER_22 = Date.UTC(2026, 9, 22, 12);

function entry(gameId: GameId, endedAt: number, changes: Readonly<Record<string, unknown>>) {
  return {
    gameId,
    endedAt,
    kind: "casual",
    result: "lost",
    place: 2,
    players: 3,
    score: 487,
    turns: 24,
    winner: { kind: "player", playerId: BEA, username: "Bea" },
    winnerScore: 512,
    ...changes,
  };
}

function seat(seatNumber: number, player: unknown, changes: Readonly<Record<string, unknown>>) {
  return {
    seat: seatNumber,
    result: "lost",
    place: seatNumber,
    leftInTurn: null,
    score: 400,
    hasReachedEndGoal: false,
    income: 19,
    fundsAndHand: 44,
    workforce: 2,
    quality: 7,
    satisfaction: 5,
    product: 0,
    distribution: 1,
    influence: 8,
    bonusTypePoints: 24,
    projects: [],
    questsCompleted: 7,
    comboGains: { workforce: 9, quality: 11, satisfaction: 7 },
    typeCounts: { Farm: 3 },
    player,
    rating: null,
    ...changes,
  };
}

const RECORD = {
  kind: "found",
  record: {
    gameId: NEWER_GAME,
    kind: "casual",
    startedAt: OCTOBER_25 - 69 * 60_000,
    endedAt: OCTOBER_25,
    turns: 24,
    winner: 1,
    bonusTypes: ["Retail", "Safety"],
    seats: [
      seat(
        1,
        { kind: "player", playerId: BEA, username: "Bea" },
        {
          result: "won",
          score: 512,
          hasReachedEndGoal: true,
          projects: ["quality", "workforce"],
        },
      ),
      seat(2, { kind: "player", playerId: ANN, username: "Ann" }, { score: 487 }),
      seat(3, { kind: "deleted" }, { result: "left", leftInTurn: 20, score: 301 }),
    ],
  },
};

function serverAnswers(answers: Readonly<Record<string, unknown>>): Array<string> {
  const asked: Array<string> = [];
  vi.stubGlobal("fetch", async (path: string) => {
    asked.push(path);
    return Promise.resolve(Response.json(answers[path] ?? { kind: "not_found" }));
  });
  return asked;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the match history page", () => {
  it("lists games newest first with links to each record and to the winners' histories", async () => {
    serverAnswers({
      [`/api/players/${ANN}/history`]: {
        kind: "found",
        username: "Ann",
        games: [
          entry(NEWER_GAME, OCTOBER_25, {}),
          entry(OLDER_GAME, OCTOBER_22, {
            kind: "ranked",
            result: "won",
            place: 1,
            winner: { kind: "deleted" },
          }),
        ],
        older: null,
      },
    });
    render(<RecordsPage page={{ kind: "history", playerId: ANN }} viewerId={BEA} token={null} />);
    const page = screen.getByRole("dialog");
    expect(await within(page).findByRole("heading", { name: "Match history · Ann" })).toBeTruthy();
    const rows = within(page).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      "25 Oct 2026Casuallost2nd of 3487Bea512324",
      "22 Oct 2026Rankedwon1st of 3487Deleted player512324",
    ]);
    expect(within(page).getByRole("link", { name: "25 Oct 2026" }).getAttribute("href")).toBe(
      `#record/${NEWER_GAME}`,
    );
    expect(within(page).getByRole("link", { name: "Bea" }).getAttribute("href")).toBe(
      `#history/${BEA}`,
    );
    expect(within(page).queryByRole("link", { name: "Deleted player" })).toBeNull();
    expect(within(page).queryByRole("button", { name: "Show older games" })).toBeNull();
  });

  it("adds the next games when showing older games", async () => {
    const asked = serverAnswers({
      [`/api/players/${ANN}/history`]: {
        kind: "found",
        username: "Ann",
        games: [entry(NEWER_GAME, OCTOBER_25, {})],
        older: { endedAt: OCTOBER_25, gameId: NEWER_GAME },
      },
      [`/api/players/${ANN}/history?before_ms=${String(OCTOBER_25)}&before_game=${NEWER_GAME}`]: {
        kind: "found",
        username: "Ann",
        games: [entry(OLDER_GAME, OCTOBER_22, {})],
        older: null,
      },
    });
    render(<RecordsPage page={{ kind: "history", playerId: ANN }} viewerId={ANN} token={null} />);
    fireEvent.click(await screen.findByRole("button", { name: "Show older games" }));
    expect(await screen.findByRole("link", { name: "22 Oct 2026" })).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Show older games" })).toBeNull();
    expect(asked).toHaveLength(2);
  });

  it("says when there are no games yet and when the account no longer exists", async () => {
    serverAnswers({
      [`/api/players/${ANN}/history`]: { kind: "found", username: "Ann", games: [], older: null },
      [`/api/players/${BEA}/history`]: { kind: "account_gone" },
    });
    const { unmount } = render(
      <RecordsPage page={{ kind: "history", playerId: ANN }} viewerId={ANN} token={null} />,
    );
    expect(await screen.findByRole("heading", { name: "No games yet" })).toBeTruthy();
    expect(screen.getByText("Games you finish, or leave, appear here.")).toBeTruthy();
    unmount();
    render(<RecordsPage page={{ kind: "history", playerId: BEA }} viewerId={ANN} token={null} />);
    expect(await screen.findByText("This player's account no longer exists.")).toBeTruthy();
  });

  it("goes back to where the player came from and says when the history could not be loaded", async () => {
    serverAnswers({});
    const back = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
    render(<RecordsPage page={{ kind: "history", playerId: ANN }} viewerId={null} token={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(back).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByText("The match history could not be loaded. Try again later."),
    ).toBeTruthy();
    back.mockRestore();
  });
});

describe("the game record page", () => {
  it("shows the game and a column per player with every recorded value", async () => {
    serverAnswers({ [`/api/records/${NEWER_GAME}`]: RECORD });
    render(
      <RecordsPage page={{ kind: "record", gameId: NEWER_GAME }} viewerId={ANN} token={null} />,
    );
    const page = screen.getByRole("dialog");
    expect(await within(page).findByRole("heading", { name: "Game record · 25 Oct 2026" })).toBe(
      within(page).getByRole("heading", { level: 1 }),
    );
    expect(page.textContent).toContain("Casual game");
    expect(page.textContent).toContain("(1 h 9 min) · 24 turns · winner Bea · bonus types:");
    expect(within(page).getByRole("img", { name: "Retail" })).toBeTruthy();
    const table = within(page).getByRole("table", { name: "Players" });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Player",
      "Bea",
      "Ann (you)",
      "Deleted player",
    ]);
    expect(within(headers[3] ?? table).queryByRole("link")).toBeNull();
    expect(within(table).getByRole("row", { name: /^Place and result/ }).textContent).toBe(
      "Place and result1st · won2nd · lost3rd · left (turn 20)",
    );
    expect(within(table).getByRole("row", { name: /^Projects completed/ }).textContent).toContain(
      "Clean up the streets, Help the homeless",
    );
    expect(within(table).getByRole("rowheader", { name: "Income" })).toBeTruthy();
    expect(within(table).getAllByRole("img", { name: "Farm 3" })).toHaveLength(3);
    expect(within(table).getAllByRole("img", { name: "Workforce +9" })).toHaveLength(3);
    expect(page.textContent).toContain("Players who left are scored with their values");
  });

  it("shows each player's rating before and its change in a ranked game", async () => {
    const [bea, ann, left] = RECORD.record.seats;
    const ranked = {
      ...RECORD,
      record: {
        ...RECORD.record,
        kind: "ranked",
        seats: [
          { ...bea, rating: { before: 1000, change: 20 } },
          { ...ann, rating: { before: 1043, change: 0 } },
          { ...left, rating: { before: 1188, change: -20 } },
        ],
      },
    };
    serverAnswers({ [`/api/records/${NEWER_GAME}`]: ranked });
    render(
      <RecordsPage page={{ kind: "record", gameId: NEWER_GAME }} viewerId={ANN} token={null} />,
    );
    const table = await screen.findByRole("table", { name: "Players" });
    expect(within(table).getByRole("row", { name: /^Rating before/ }).textContent).toBe(
      "Rating before100010431188",
    );
    expect(within(table).getByRole("row", { name: /^Rating change/ }).textContent).toBe(
      "Rating change+200−20",
    );
  });

  it("shows no rating rows in a casual game", async () => {
    serverAnswers({ [`/api/records/${NEWER_GAME}`]: RECORD });
    render(
      <RecordsPage page={{ kind: "record", gameId: NEWER_GAME }} viewerId={ANN} token={null} />,
    );
    const table = await screen.findByRole("table", { name: "Players" });
    expect(within(table).queryByRole("rowheader", { name: "Rating before" })).toBeNull();
    expect(within(table).queryByRole("rowheader", { name: "Rating change" })).toBeNull();
  });

  it("says when a game record does not exist", async () => {
    serverAnswers({});
    render(
      <RecordsPage page={{ kind: "record", gameId: OLDER_GAME }} viewerId={null} token={null} />,
    );
    expect(await screen.findByText("This game record does not exist.")).toBeTruthy();
  });
});
