import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AccountRating } from "../../../shared/api/AccountRating";
import type { AccountBinding } from "../account/AccountBinding";
import { testAccount } from "../../testing/testAccount";
import { OUT_OF_QUEUE, testRankedQueue } from "../../testing/testRankedQueue";
import { LobbyPage } from "./LobbyPage";

async function succeed() {
  return Promise.resolve(null);
}

function registeredAccount(ratings: ReadonlyArray<AccountRating>): AccountBinding {
  let loads = 0;
  return testAccount({
    name: "Ann",
    isGuest: false,
    onLoadAccount: vi.fn(async () => {
      const rating = ratings[Math.min(loads, ratings.length - 1)] ?? null;
      loads += 1;
      return Promise.resolve({
        isLoggedIn: true as const,
        name: "Ann",
        usernameWait: null,
        email: null,
        rating,
      });
    }),
  });
}

function lobbyPage(account: AccountBinding, standingCheck: string) {
  return (
    <LobbyPage
      account={account}
      joinError={null}
      removal={null}
      onJoin={vi.fn()}
      onCreate={succeed}
      onStartAsGuest={succeed}
      onLogIn={succeed}
      onSignUp={succeed}
      onForgotPassword={vi.fn()}
      onDismissRemoval={vi.fn()}
      publicRooms={[]}
      playersOnline={[]}
      ranked={testRankedQueue({ queue: OUT_OF_QUEUE, standingCheck })}
    />
  );
}

function userBox(): HTMLElement {
  return screen.getByRole("button", { name: "Your account" });
}

describe("the own rating in the lobby", () => {
  it("shows a registered user's rating in the user box and the ranked queue panel", async () => {
    render(lobbyPage(registeredAccount([{ rating: 1043, rankedGames: 12 }]), ""));
    await act(async () => Promise.resolve());
    expect(userBox().textContent).toContain("Rating 1043");
    const panel = screen.getByRole("region", { name: "Ranked queue" });
    expect(panel.textContent).toContain("Your rating: 1043 · 12 ranked games");
  });

  it("shows the starting rating before the first ranked game and one game in the singular", async () => {
    const account = registeredAccount([
      { rating: 1000, rankedGames: 0 },
      { rating: 1020, rankedGames: 1 },
    ]);
    const { rerender } = render(lobbyPage(account, "before"));
    await act(async () => Promise.resolve());
    expect(userBox().textContent).toContain("Rating 1000");
    expect(screen.getByText("Your rating: 1000 · 0 ranked games")).toBeDefined();
    rerender(lobbyPage(account, "after"));
    await act(async () => Promise.resolve());
    expect(userBox().textContent).toContain("Rating 1020");
    expect(screen.getByText("Your rating: 1020 · 1 ranked game")).toBeDefined();
  });

  it("shows Guest and no rating for a guest user", async () => {
    render(lobbyPage(testAccount({ name: "Ann", isGuest: true }), ""));
    await act(async () => Promise.resolve());
    expect(userBox().textContent).toContain("Guest");
    expect(userBox().textContent).not.toContain("Rating");
    expect(screen.queryByText(/Your rating/)).toBeNull();
  });
});
