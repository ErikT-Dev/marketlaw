import { fireEvent, render, screen } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import { PlayerId } from "../../shared/PlayerId";
import { TutorialRefusalToast } from "../screens/menu/TutorialRefusalToast";
import { ClientStore } from "./ClientStore";
import { writeSession } from "./writeSession";

type SentRequest = { readonly path: string; readonly body: unknown };

const PLAYER_ID = "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10";

const NO_HOST: GameHost = {
  sendAction: () => null,
  sendRoomAction: () => false,
  sendTutorialAction: () => null,
  requestResync: () => undefined,
  subscribe: () => () => undefined,
  close: () => undefined,
};

function serverAnswersTutorial(answer: unknown): ReadonlyArray<SentRequest> {
  const sent: SentRequest[] = [];
  vi.stubGlobal("fetch", (path: string, init: { readonly body: string }) => {
    sent.push({ path, body: JSON.parse(init.body) });
    return Promise.resolve(
      Response.json(
        path === "/api/session"
          ? { isLoggedIn: true, playerId: PLAYER_ID, name: "Ann", isGuest: true }
          : answer,
      ),
    );
  });
  return sent;
}

function storeInLobby(): ClientStore {
  writeSession({
    token: "guest-token",
    playerId: v.parse(PlayerId, PLAYER_ID),
    name: "Ann",
    isGuest: true,
    roomCode: null,
  });
  return new ClientStore(() => NO_HOST);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("starting the tutorial", () => {
  it("asks the server to start it with the player's token", async () => {
    const sent = serverAnswersTutorial({ isOk: true });
    const store = storeInLobby();
    store.startTutorial();
    await vi.waitFor(() => {
      expect(sent).toContainEqual({ path: "/api/tutorials", body: { token: "guest-token" } });
    });
    expect(store.getSnapshot().tutorialRefusal).toBeNull();
  });

  it("shows why the server refused it until the player closes the message", async () => {
    serverAnswersTutorial({ isOk: false, reason: "site_daily_cap" });
    const store = storeInLobby();
    render(<TutorialRefusalToast store={store} />);
    store.startTutorial();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Daily limit reached, try again after 00:00 UTC");
    fireEvent.click(screen.getByRole("button", { name: "Close: The tutorial did not start" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(store.getSnapshot().tutorialRefusal).toBeNull();
  });

  it("says the server did not answer when the answer is not understood", async () => {
    serverAnswersTutorial({ started: "maybe" });
    const store = storeInLobby();
    store.startTutorial();
    await vi.waitFor(() => {
      expect(store.getSnapshot().tutorialRefusal).toBe("no_answer");
    });
  });
});
