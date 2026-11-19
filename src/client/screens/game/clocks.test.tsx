import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { PlayerView } from "../../../shared/PlayerView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const STARTED = 1_000_000;
const NOW = STARTED + 60_000;

function clockFrom(bankMs: number, freeMs: number, limitMs: number) {
  return {
    bankMs,
    freeUntil: v.parse(EpochMs, STARTED + freeMs),
    deadline: v.parse(EpochMs, STARTED + Math.min(limitMs, freeMs + bankMs)),
  };
}

function withClocks(view: PlayerView): PlayerView {
  return {
    ...view,
    seats: view.seats.map((seat) =>
      seat.seat === 3
        ? { ...seat, timeBankMs: 600_000, clock: clockFrom(600_000, 45_000, 180_000) }
        : seat,
    ),
  };
}

function showWith(changes: Partial<PlayerView>, own: Parameters<typeof roomUpdateWith>[1]) {
  const update = roomUpdateWith(changes, own);
  const game = update.game;
  const props = gamePageProps(
    game === null ? update : { ...update, game: { ...game, view: withClocks(game.view) } },
  );
  render(<GamePage {...props} />);
  return props;
}

describe("clocks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows my main-phase time left and my bank running after the free time", () => {
    showWith({}, { timeBankMs: 900_000, clock: clockFrom(900_000, 45_000, 180_000) });
    const bar = screen.getByRole("banner");
    expect(within(bar).getByRole("timer", { name: "Time left 2:00" })).toBeDefined();
    expect(within(bar).getByRole("timer", { name: "Bank 14:45" })).toBeDefined();
  });

  it("shows another player's bank counting down live", () => {
    showWith({}, {});
    const opponent = screen.getByRole("article", { name: "Quick summary table of Cy" });
    expect(within(opponent).getByRole("timer", { name: "Bank 9:45" })).toBeDefined();
  });

  it("shows whose market go it is and how long they have left", () => {
    showWith({ phase: "market", marketGo: 3 }, { timeBankMs: 300_000 });
    const bar = screen.getByRole("banner");
    expect(within(bar).getByRole("timer", { name: "Go: Cy 2:00" })).toBeDefined();
    expect(within(bar).getByRole("timer", { name: "Bank 5:00" })).toBeDefined();
  });

  it("in my main phase also shows whose market go it is while later players have their go", () => {
    showWith(
      { phase: "main", marketGo: 3 },
      { hasHadMarketGo: true, timeBankMs: 0, clock: clockFrom(0, 75_000, 210_000) },
    );
    const bar = screen.getByRole("banner");
    expect(within(bar).getByRole("timer", { name: "Time left 0:15" })).toBeDefined();
    expect(within(bar).getByRole("timer", { name: "Go: Cy 2:00" })).toBeDefined();
  });
});

describe("running out of time", () => {
  it("shows Out of time in my clock and says I can keep playing", () => {
    showWith({}, { isOutOfTime: true, timeBankMs: 0 });
    const bar = within(screen.getByRole("banner"));
    expect(bar.getByText("Out of time")).toBeDefined();
    expect(bar.queryByRole("timer", { name: /^Time left/ })).toBeNull();
    expect(
      screen.getByText(
        "You are out of time. You can keep playing until the other players are done.",
      ),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "End turn" })).toBeDefined();
  });

  it("shows another player out of time in the player order and on their card", () => {
    const update = roomUpdateWith({});
    const game = update.game;
    const view =
      game === null
        ? null
        : {
            ...game.view,
            seats: game.view.seats.map((seat) =>
              seat.seat === 4 ? { ...seat, isOutOfTime: true } : seat,
            ),
          };
    render(
      <GamePage
        {...gamePageProps(
          game === null || view === null ? update : { ...update, game: { ...game, view } },
        )}
      />,
    );
    const order = within(screen.getByRole("list", { name: "Player order" }));
    expect(
      order.getAllByRole("listitem").find((item) => item.textContent.includes("Di"))?.textContent,
    ).toContain("out of time");
    expect(
      within(screen.getByRole("article", { name: "Quick summary table of Di" })).getByText(
        "out of time",
      ),
    ).toBeDefined();
  });

  it("says in a ranked game how many time-outs in a row the player has had, out of 3", () => {
    const props = {
      ...gamePageProps(roomUpdateWith({})),
      timeOutNotice: { kind: "timed_out" as const, gameKind: "ranked" as const, inARow: 2, of: 3 },
    };
    render(<GamePage {...props} />);
    const toast = screen.getByRole("status");
    expect(toast.textContent).toContain("Your time ran out");
    expect(toast.textContent).toContain("This was 2 of 3.");
    fireEvent.click(within(toast).getByRole("button", { name: "Close: Your time ran out" }));
    expect(props.onDismissTimeOutNotice).toHaveBeenCalledTimes(1);
  });

  it("says in a casual game that the player can keep playing", () => {
    const props = {
      ...gamePageProps(roomUpdateWith({})),
      timeOutNotice: { kind: "timed_out" as const, gameKind: "casual" as const },
    };
    render(<GamePage {...props} />);
    const toast = screen.getByRole("status");
    expect(toast.textContent).toContain("Your time ran out");
    expect(toast.textContent).toContain("You can keep playing until the other players are done.");
    expect(toast.textContent).not.toContain("of 3");
  });
});
