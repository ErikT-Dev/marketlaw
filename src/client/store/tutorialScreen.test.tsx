import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { TutorialIntent } from "../../shared/protocol/TutorialIntent";
import { RoomCode } from "../../shared/RoomCode";
import { tutorialViewAt } from "../testing/tutorialViewAt";
import { TutorialStartingScreen } from "../TutorialStartingScreen";
import { ClientStore } from "./ClientStore";
import { readSession } from "./readSession";
import { writeSession } from "./writeSession";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";

const PLAYER_ID = "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10";

type Opened = { readonly player: string; readonly token: string };

type FakeTutorial = {
  readonly store: ClientStore;
  readonly opened: ReadonlyArray<Opened>;
  readonly sent: ReadonlyArray<TutorialIntent | ActionIntent>;
  readonly roomClosed: () => boolean;
  readonly emit: (event: HostEvent) => void;
};

function connectedTo(
  sent: Array<TutorialIntent | ActionIntent>,
  listen: (l: (event: HostEvent) => void) => void,
): GameHost {
  let nextId = 1;
  return {
    sendAction: (action) => {
      sent.push(action);
      return `move-${String(nextId++)}`;
    },
    sendRoomAction: () => true,
    sendTutorialAction: (action) => {
      sent.push(action);
      return `step-${String(nextId++)}`;
    },
    requestResync: () => undefined,
    subscribe: (listener) => {
      listen(listener);
      return () => undefined;
    },
    close: () => undefined,
  };
}

function storeWith(roomCode: RoomCode | null, isInTutorial: boolean): FakeTutorial {
  writeSession({
    token: "guest-token",
    playerId: v.parse(PlayerId, PLAYER_ID),
    name: "Ann",
    isGuest: true,
    roomCode,
    isInTutorial,
  });
  const opened: Opened[] = [];
  const sent: Array<TutorialIntent | ActionIntent> = [];
  let tutorialListener: ((event: HostEvent) => void) | null = null;
  let isRoomClosed = false;
  const room: GameHost = {
    ...connectedTo([], () => undefined),
    close: () => {
      isRoomClosed = true;
    },
  };
  const store = new ClientStore(
    () => room,
    undefined,
    undefined,
    (player, token) => {
      opened.push({ player, token });
      return connectedTo(sent, (listener) => {
        tutorialListener = listener;
      });
    },
  );
  return {
    store,
    opened,
    sent,
    roomClosed: () => isRoomClosed,
    emit: (event) => {
      act(() => {
        tutorialListener?.(event);
      });
    },
  };
}

function serverAnswersTutorial(answer: unknown): void {
  vi.stubGlobal("fetch", (path: string) =>
    Promise.resolve(
      Response.json(
        path === "/api/session"
          ? {
              isLoggedIn: true,
              playerId: PLAYER_ID,
              name: "Ann",
              isGuest: true,
              icon: TEST_PLAYER_ICON,
            }
          : answer,
      ),
    ),
  );
}

function showStep(fake: FakeTutorial, step: "T1.1" | "T1.2", number: number): void {
  fake.emit({ type: "connection", status: "open" });
  fake.emit({
    type: "tutorial_update",
    view: tutorialViewAt({ kind: "step", step, number }),
    playerIcon: TEST_PLAYER_ICON,
    acceptedActionId: null,
    serverNow: v.parse(EpochMs, Date.now()),
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the tutorial screen", () => {
  it("opens the tutorial room after the server starts the tutorial and remembers it", async () => {
    serverAnswersTutorial({ isOk: true });
    const fake = storeWith(null, false);
    fake.store.startTutorial();
    await vi.waitFor(() => {
      expect(fake.opened).toEqual([{ player: PLAYER_ID, token: "guest-token" }]);
    });
    expect(readSession()?.isInTutorial).toBe(true);
    render(<TutorialStartingScreen store={fake.store} />);
    showStep(fake, "T1.1", 1);
    expect(screen.getByRole("heading", { name: "Tutorial · turn 1" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Step 1 of 19" })).toBeTruthy();
  });

  it("takes a player whose game has ended out of the room when the tutorial starts", async () => {
    serverAnswersTutorial({ isOk: true });
    const fake = storeWith(v.parse(RoomCode, "ABCDEF"), false);
    fake.store.startTutorial();
    await vi.waitFor(() => {
      expect(fake.opened).toHaveLength(1);
    });
    expect(fake.roomClosed()).toBe(true);
    expect(fake.store.getSnapshot().session?.roomCode).toBeNull();
  });

  it("brings a player in a tutorial back to it when the site opens", () => {
    const fake = storeWith(null, true);
    expect(fake.opened).toEqual([{ player: PLAYER_ID, token: "guest-token" }]);
    render(<TutorialStartingScreen store={fake.store} />);
    showStep(fake, "T1.2", 2);
    expect(screen.getByText("Play Row House.")).toBeTruthy();
  });

  it("sends Continue, Restart and the game moves to the tutorial room", () => {
    const fake = storeWith(null, true);
    render(<TutorialStartingScreen store={fake.store} />);
    showStep(fake, "T1.1", 1);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    act(() => {
      fake.store.sendTutorialMove({ type: "end_turn" });
    });
    expect(fake.sent).toEqual([
      { type: "continue" },
      { type: "restart_tutorial" },
      { type: "end_turn" },
    ]);
    expect(fake.store.getSnapshot().pendingActions).toHaveLength(1);
  });

  it("shows why a Restart was refused", () => {
    const fake = storeWith(null, true);
    render(<TutorialStartingScreen store={fake.store} />);
    showStep(fake, "T1.2", 2);
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    fake.emit({ type: "rejected", code: "site_daily_cap", actionId: "step-1", sendAgainAt: null });
    expect(screen.getByText("Daily limit reached, try again after 00:00 UTC")).toBeTruthy();
  });

  it("asks before leaving and goes to the lobby when the room says the player left", () => {
    const fake = storeWith(null, true);
    render(<TutorialStartingScreen store={fake.store} />);
    showStep(fake, "T1.2", 2);
    fireEvent.click(screen.getByRole("button", { name: "Leave tutorial" }));
    const dialog = screen.getByRole("dialog", { name: "Leave the tutorial?" });
    expect(
      within(dialog).getByText(
        "Your progress in the tutorial is lost. You can start it again from the beginning any time from the game menu.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(fake.sent).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Leave tutorial" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Leave tutorial" }),
    );
    expect(fake.sent).toEqual([{ type: "leave_tutorial" }]);
    fake.emit({ type: "removed", reason: "left", rejoinAt: null });
    expect(fake.store.getSnapshot().tutorial).toBeNull();
    expect(readSession()?.isInTutorial).toBe(false);
  });

  it("goes back to the lobby when the tutorial room is gone", () => {
    const fake = storeWith(null, true);
    fake.emit({ type: "connection", status: "room_gone" });
    expect(fake.store.getSnapshot().session?.isInTutorial).toBe(false);
  });
});
