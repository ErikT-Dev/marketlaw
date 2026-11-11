import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../../shared/GameHost";
import { PlayerId } from "../../../shared/PlayerId";
import { App } from "../../App";
import { ClientStore } from "../../store/ClientStore";
import { writeSession } from "../../store/writeSession";

const ANN = v.parse(PlayerId, "0f4c2a5e-1b7d-4e3a-9c8f-2d6b1a0e5f71");

function idleHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function serverAnswers(): void {
  vi.stubGlobal("fetch", async (path: string) =>
    Promise.resolve(
      Response.json(
        path === "/api/session"
          ? { isLoggedIn: true, playerId: ANN, name: "Ann", isGuest: false }
          : { kind: "found", username: "Ann", games: [], older: null },
      ),
    ),
  );
}

async function hashChanged(): Promise<void> {
  await act(async () => {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return Promise.resolve();
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("record pages in the app", () => {
  it("opens the own match history from the lobby over the lobby and closes it again", async () => {
    serverAnswers();
    writeSession({
      token: "ann-token",
      playerId: ANN,
      name: "Ann",
      isGuest: false,
      roomCode: null,
    });
    render(<App store={new ClientStore(() => idleHost())} />);
    const createRoom = screen.getByRole("button", { name: "Create room" });
    fireEvent.click(screen.getByRole("button", { name: "My match history" }));
    await hashChanged();
    const page = await screen.findByRole("dialog", { name: "Match history · Ann" });
    expect(within(page).getByRole("heading", { name: "No games yet" })).toBeTruthy();
    expect(createRoom.isConnected).toBe(true);
    window.history.replaceState(null, "", "/");
    await hashChanged();
    expect(screen.queryByRole("dialog", { name: /Match history/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Create room" })).toBe(createRoom);
  });

  it("shows no match history button to a visitor who is not logged in", () => {
    serverAnswers();
    render(<App store={new ClientStore(() => idleHost())} />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "My match history" })).toBeNull();
  });
});
