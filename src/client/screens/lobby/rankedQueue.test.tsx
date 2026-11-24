import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { TEST_PLAYER_ICON } from "../../../shared/testing/TEST_PLAYER_ICON";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { QueueView } from "../../../shared/protocol/QueueView";
import type { AccountBinding } from "../account/AccountBinding";
import { testAccount } from "../../testing/testAccount";
import { OUT_OF_QUEUE, testRankedQueue } from "../../testing/testRankedQueue";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { LobbyToasts } from "./LobbyToasts";
import { RankedQueueSection } from "./RankedQueueSection";

const NOW = 1_761_436_800_000;
const CONFIRMED_ACCOUNT = testAccount({
  name: "Ann",
  isGuest: false,
  onLoadAccount: vi.fn(async () =>
    Promise.resolve({
      isLoggedIn: true as const,
      name: "Ann",
      usernameWait: null,
      icon: TEST_PLAYER_ICON,
      iconWait: null,
      email: {
        address: "ann@example.com",
        isConfirmed: true,
        pendingAddress: null,
        wasRemoved: false,
      },
      rating: { rating: 1043, rankedGames: 12 },
    }),
  ),
});

afterEach(() => {
  localStorage.clear();
});

async function showQueue(
  queue: QueueView,
  changes: Partial<RankedQueueBinding> = {},
  account: AccountBinding | null = CONFIRMED_ACCOUNT,
) {
  const ranked = testRankedQueue({ queue, ...changes });
  const loaded = account === null || account.isGuest ? null : await account.onLoadAccount();
  const details = loaded?.isLoggedIn === true ? loaded : null;
  render(<RankedQueueSection account={account} details={details} ranked={ranked} now={NOW} />);
  await act(async () => Promise.resolve());
  return { ranked, panel: screen.getByRole("region", { name: "Ranked queue" }) };
}

function sizeSwitch(players: number) {
  return screen.getByRole("switch", { name: `${String(players)} players` });
}

describe("the ranked queue panel", () => {
  it("shows the counts per game size and joins with the chosen sizes", async () => {
    const { ranked, panel } = await showQueue(OUT_OF_QUEUE);
    expect(panel.textContent).toContain("4 players in the queue");
    expect(panel.textContent).toContain("2 players: 1 · 3 players: 2 · 4 players: 1");
    expect(panel.textContent).toContain("Ranked games change ELO ratings.");
    expect(panel.textContent).toContain("Your rating: 1043 · 12 ranked games");
    fireEvent.click(sizeSwitch(4));
    fireEvent.click(screen.getByRole("button", { name: "Join the ranked queue" }));
    expect(ranked.onIntent).toHaveBeenCalledWith({ type: "join_queue", sizes: [3, 4] });
  });

  it("keeps the last chosen game size on and remembers the choice in the browser", async () => {
    await showQueue(OUT_OF_QUEUE);
    expect(sizeSwitch(3)).toHaveProperty("disabled", true);
    fireEvent.click(sizeSwitch(2));
    fireEvent.click(sizeSwitch(3));
    expect(localStorage.getItem("marketlaw.rankedGameSizes")).toBe("[2]");
  });

  it("changes the game sizes in the queue and offers leaving it", async () => {
    const queue: QueueView = { ...OUT_OF_QUEUE, own: { kind: "waiting", sizes: [3] } };
    const { ranked, panel } = await showQueue(queue);
    expect(panel.textContent).toContain("You are in the queue");
    expect(panel.textContent).toContain("4 players are in the queue, including you.");
    fireEvent.click(sizeSwitch(2));
    expect(ranked.onIntent).toHaveBeenCalledWith({ type: "change_sizes", sizes: [2, 3] });
    fireEvent.click(screen.getByRole("button", { name: "Leave the queue" }));
    expect(ranked.onIntent).toHaveBeenCalledWith({ type: "leave_queue" });
  });

  it("disables joining with the reason for logged out players", async () => {
    await showQueue(OUT_OF_QUEUE, {}, null);
    expect(screen.getByText("Log in or sign up to play ranked games.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Join the ranked queue" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("disables joining with the reason for guest users", async () => {
    await showQueue(OUT_OF_QUEUE, {}, testAccount({ isGuest: true }));
    expect(screen.queryByText(/Your rating/)).toBeNull();
    expect(
      screen.getByText("Sign up and confirm your email address to play ranked games."),
    ).toBeDefined();
  });

  it("asks an unconfirmed email address to be confirmed and sends the link again", async () => {
    const account = testAccount({ isGuest: false });
    await showQueue(OUT_OF_QUEUE, {}, account);
    expect(screen.getByText(/Confirm your email address to play ranked games/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Send it again" }));
    expect(await screen.findByText("We sent the link again.")).toBeDefined();
    expect(account.onSendConfirmationAgain).toHaveBeenCalled();
  });

  it("disables joining during a rejoin wait", async () => {
    const rejoinAt = v.parse(EpochMs, NOW + 102_000);
    await showQueue({ ...OUT_OF_QUEUE, own: { kind: "out", rejoinAt, dailyLimit: null } });
    expect(screen.getByText("You can join the ranked queue again in 1:42.")).toBeDefined();
  });

  it("disables joining at the player own daily limit", async () => {
    const limited = {
      kind: "out" as const,
      rejoinAt: null,
      dailyLimit: "daily_game_start_limit" as const,
    };
    await showQueue({ ...OUT_OF_QUEUE, own: limited });
    expect(
      screen.getByText(
        "You have started 10 games today, the most per day. Try again after 00:00 UTC.",
      ),
    ).toBeDefined();
  });

  it("shows the matching reason for a rejected join", async () => {
    await showQueue(OUT_OF_QUEUE, { rejection: "email_not_confirmed" });
    expect(within(screen.getByRole("alert")).getByText(/Confirm your email address/)).toBeDefined();
  });

  it("tells everyone in the queue while the site game limit holds matches back", async () => {
    const waiting = { ...OUT_OF_QUEUE, own: { kind: "waiting" as const, sizes: [3 as const] } };
    await showQueue({ ...waiting, isSiteGameLimitReached: true });
    expect(screen.getByText("Daily game limit reached, try again after 00:00 UTC")).toBeDefined();
  });
});

describe("the match found dialog", () => {
  const deadline = v.parse(EpochMs, NOW + 17_000);

  it("asks to confirm without names and sends confirm or decline", async () => {
    const own = { kind: "confirming" as const, size: 3 as const, deadline, isConfirmed: false };
    const { ranked } = await showQueue({ ...OUT_OF_QUEUE, own });
    const dialog = screen.getByRole("dialog", { name: "3-player match found!" });
    expect(dialog.textContent).toContain(
      "A ranked game with 3 players is ready. Confirm that you will play.",
    );
    expect(dialog.textContent).toContain("0:17 left to confirm.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));
    expect(ranked.onIntent).toHaveBeenCalledWith({ type: "confirm_match" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Decline" }));
    expect(ranked.onIntent).toHaveBeenCalledWith({ type: "decline_match" });
  });

  it("says the player confirmed and waits without counting the others", async () => {
    const own = { kind: "confirming" as const, size: 2 as const, deadline, isConfirmed: true };
    await showQueue({ ...OUT_OF_QUEUE, own });
    const dialog = screen.getByRole("dialog", { name: "2-player match found!" });
    expect(dialog.textContent).toContain("Confirmed. Waiting for the other players. 0:17 left.");
    expect(within(dialog).queryByRole("button")).toBeNull();
  });

  it("shows the panel behind it with the counts and without the in-queue texts", async () => {
    const own = { kind: "confirming" as const, size: 3 as const, deadline, isConfirmed: false };
    const { panel } = await showQueue({ ...OUT_OF_QUEUE, own });
    expect(panel.textContent).toContain("4 players in the queue");
    expect(panel.textContent).toContain("Ranked games change ELO ratings.");
    expect(panel.textContent).not.toContain("You are in the queue");
    expect(panel.textContent).not.toContain("including you");
  });
});

describe("the notices after a match that did not start", () => {
  function showNotice(notice: NonNullable<RankedQueueBinding["notice"]>) {
    const ranked = testRankedQueue({ notice });
    render(<LobbyToasts removal={null} ranked={ranked} now={NOW} onDismissRemoval={vi.fn()} />);
    return { ranked, toast: screen.getByRole("status") };
  }

  it("tells a player who confirmed that they are back at the front of the queue", () => {
    const { ranked, toast } = showNotice({ kind: "match_not_started", reason: "not_confirmed" });
    expect(toast.textContent).toContain(
      "The match did not start because a player did not confirm. You are back at the front of the queue.",
    );
    fireEvent.click(within(toast).getByRole("button", { name: /Close/ }));
    expect(ranked.onDismissNotice).toHaveBeenCalled();
  });

  it("tells a player who did not confirm when they can join again", () => {
    const { toast } = showNotice({
      kind: "match_missed",
      rejoinAt: v.parse(EpochMs, NOW + 120_000),
    });
    expect(toast.textContent).toContain(
      "You did not confirm the match and left the queue. You can join it again in 2:00.",
    );
  });

  it("says when another player reached a daily limit", () => {
    showNotice({ kind: "match_not_started", reason: "player_daily_limit" });
    expect(screen.getByText(/a player has reached a daily limit/)).toBeDefined();
  });
});
