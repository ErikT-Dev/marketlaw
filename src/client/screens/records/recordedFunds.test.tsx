import { render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameId } from "../../../shared/GameId";
import { recordedSeatOf } from "../../testing/recordedSeatOf";
import { RecordsPage } from "./RecordsPage";

const GAME = v.parse(GameId, "4e7a1c9b-3d5f-4b2e-a8c6-0f9d2e4b7a13");
const ENDED_AT = Date.UTC(2026, 10, 24, 12);
const DELETED = { kind: "deleted" };

function answerWithSeats(seats: ReadonlyArray<unknown>): void {
  const record = {
    kind: "found",
    record: {
      gameId: GAME,
      kind: "casual",
      startedAt: ENDED_AT - 30 * 60_000,
      endedAt: ENDED_AT,
      turns: 30,
      winner: 1,
      bonusTypes: ["Retail", "Safety"],
      seats,
    },
  };
  vi.stubGlobal("fetch", async (path: string) =>
    Promise.resolve(Response.json(path === `/api/records/${GAME}` ? record : {})),
  );
}

async function playersTable(): Promise<HTMLElement> {
  render(<RecordsPage page={{ kind: "record", gameId: GAME }} viewerId={null} token={null} />);
  return screen.findByRole("table", { name: "Players" });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the funds and cards in hand of a game record", () => {
  it("shows funds and cards in hand as two rows", async () => {
    answerWithSeats([
      recordedSeatOf(1, DELETED, { result: "won", funds: 25, cardsInHand: 3 }),
      recordedSeatOf(2, DELETED, { funds: 140, cardsInHand: 0 }),
    ]);
    const table = await playersTable();
    const funds = within(table).getByRole("row", { name: /^Funds/ });
    const cardsInHand = within(table).getByRole("row", { name: /^Cards in hand/ });
    expect(
      within(funds)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["25", "140"]);
    expect(
      within(cardsInHand)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["3", "0"]);
    expect(within(table).queryByRole("rowheader", { name: "Funds + cards in hand" })).toBeNull();
  });

  it("shows a record saved before the split with its funds plus cards in hand as before", async () => {
    const savedBefore = { funds: undefined, cardsInHand: undefined };
    answerWithSeats([
      recordedSeatOf(1, DELETED, { ...savedBefore, result: "won", fundsAndHand: 12 }),
      recordedSeatOf(2, DELETED, { ...savedBefore, fundsAndHand: 9 }),
    ]);
    const table = await playersTable();
    const fundsAndHand = within(table).getByRole("row", { name: /^Funds \+ cards in hand/ });
    expect(
      within(fundsAndHand)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["12", "9"]);
    expect(within(table).queryByRole("rowheader", { name: "Funds" })).toBeNull();
    expect(within(table).queryByRole("rowheader", { name: "Cards in hand" })).toBeNull();
  });
});
