import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testAccount } from "../../testing/testAccount";
import { OUT_OF_QUEUE, testRankedQueue } from "../../testing/testRankedQueue";
import type { AccountBinding } from "../account/AccountBinding";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { TutorialStart } from "../menu/TutorialStart";
import { LobbyPage } from "./LobbyPage";

async function succeed() {
  return Promise.resolve(null);
}

function lobby(account: AccountBinding | null, ranked: RankedQueueBinding = testRankedQueue()) {
  const startTutorial = vi.fn();
  render(
    <TutorialStart.Provider value={startTutorial}>
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
        ranked={ranked}
      />
    </TutorialStart.Provider>,
  );
  return startTutorial;
}

function chooseTutorial() {
  fireEvent.click(screen.getByRole("button", { name: "Game menu" }));
  const menu = screen.getByRole("list", { name: "Game menu" });
  const entry = within(menu).getByRole("button", { name: "Tutorial" });
  fireEvent.click(entry);
  return entry;
}

describe("starting the tutorial from the lobby", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts it at once for a player with an account", () => {
    const startTutorial = lobby(testAccount({ name: "Ann" }));
    chooseTutorial();
    expect(startTutorial).toHaveBeenCalledTimes(1);
  });

  it("asks a visitor for a username first and does not start it yet", async () => {
    vi.stubGlobal("fetch", async () =>
      Promise.resolve(Response.json({ name: "Busy Harbour Mayor" })),
    );
    const startTutorial = lobby(null);
    chooseTutorial();
    expect(await screen.findByRole("dialog", { name: "Choose a username" })).toBeDefined();
    expect(startTutorial).not.toHaveBeenCalled();
  });

  it("shows it disabled while the player is in the ranked queue", () => {
    const queue = { ...OUT_OF_QUEUE, own: { kind: "waiting" as const, sizes: [3] as const } };
    const startTutorial = lobby(testAccount({ name: "Ann" }), testRankedQueue({ queue }));
    const entry = chooseTutorial();
    expect(entry.getAttribute("aria-disabled")).toBe("true");
    expect(startTutorial).not.toHaveBeenCalled();
  });
});
