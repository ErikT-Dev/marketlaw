import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { RoomView } from "../../../shared/protocol/RoomView";
import { RoomCode } from "../../../shared/RoomCode";
import { LobbyPage } from "./LobbyPage";
import { WaitingRoomPage } from "./WaitingRoomPage";

async function succeed() {
  return Promise.resolve(null);
}

function lobby(changes: Partial<Parameters<typeof LobbyPage>[0]> = {}) {
  const onJoin = vi.fn();
  render(
    <LobbyPage
      name="Ann"
      joinError={null}
      removal={null}
      onJoin={onJoin}
      onCreate={succeed}
      onStartAsGuest={succeed}
      onDismissRemoval={vi.fn()}
      {...changes}
    />,
  );
  return { onJoin };
}

function room(changes: Partial<RoomView> = {}): RoomView {
  return {
    code: v.parse(RoomCode, "K7QR2P"),
    size: 4,
    isPublic: true,
    ownerName: "Quiet River Baron",
    playerNames: ["Quiet River Baron", "Ann", "Bea"],
    mySeat: null,
    asking: null,
    ...changes,
  };
}

function waitingRoom(view: RoomView) {
  const handlers = { onChangeSize: vi.fn(), onAccept: vi.fn(), onDecline: vi.fn() };
  render(
    <WaitingRoomPage room={view} myName="Ann" onLeave={vi.fn()} rejection={null} {...handlers} />,
  );
  return handlers;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the lobby", () => {
  it("joins with the typed room code when the player has an account", () => {
    const { onJoin } = lobby();
    fireEvent.change(screen.getByRole("textbox", { name: "Room code" }), {
      target: { value: "k7qr2p" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Join with code" }));
    expect(onJoin).toHaveBeenCalledWith("k7qr2p");
  });

  it("shows why joining failed under the room code field", () => {
    lobby({ joinError: { code: "K7QR2X", reason: "room_not_found", rejoinAt: null } });
    expect(screen.getByRole("alert").textContent).toContain(
      "No room has the code K7QR2X. Check the code and try again.",
    );
  });

  it("shows the time left before a declined room can be joined again", () => {
    const rejoinAt = v.parse(EpochMs, Date.now() + 102_500);
    lobby({ joinError: { code: "K7QR2P", reason: "rejoin_too_soon", rejoinAt } });
    expect(screen.getByRole("alert").textContent).toContain(
      "You can join this room again in 1:42.",
    );
  });

  it("asks a player without an account for a username prefilled with a generated name", async () => {
    vi.stubGlobal("fetch", async () =>
      Promise.resolve(Response.json({ name: "Busy Harbour Mayor" })),
    );
    const { onJoin } = lobby({ name: null });
    fireEvent.change(screen.getByRole("textbox", { name: "Room code" }), {
      target: { value: "K7QR2P" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Join with code" }));
    const dialog = await screen.findByRole("dialog", { name: "Choose a username" });
    expect(within(dialog).getByRole("textbox", { name: "Username" })).toHaveProperty(
      "value",
      "Busy Harbour Mayor",
    );
    expect(within(dialog).getByRole("button", { name: "Continue" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(onJoin).not.toHaveBeenCalled();
  });

  it("tells a removed player when they can join the room again", () => {
    const rejoinAt = v.parse(EpochMs, Date.now() + 120_500);
    lobby({ removal: { code: "K7QR2P", reason: "timed_out", rejoinAt } });
    expect(screen.getByRole("status").textContent).toContain("Removed from room K7QR2P");
    expect(screen.getByRole("status").textContent).toContain(
      "You did not accept the game in time. You can join that room again in 2:00.",
    );
  });
});

describe("the waiting room", () => {
  it("shows the code, the owner, the players and the free places", () => {
    waitingRoom(room());
    expect(screen.getByRole("heading", { name: "Room K7QR2P" })).toBeTruthy();
    expect(screen.getByText("Public room · owner: Quiet River Baron")).toBeTruthy();
    const players = screen.getByRole("list", { name: "Players in the room" });
    expect(
      within(players)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Quiet River Baronowner", "Youyou", "Bea", "Free place: waiting for 1 more player"]);
  });

  it("lets only the owner change the size and never below the players present", () => {
    waitingRoom(room());
    expect(screen.getByRole("button", { name: "4 players" })).toHaveProperty("disabled", true);
    cleanUpAndShowAsOwner();
    expect(screen.getByRole("button", { name: "2 players" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "3 players" })).toHaveProperty("disabled", false);
  });

  it("asks to accept the game with the time left and who has accepted", () => {
    const deadline = v.parse(EpochMs, Date.now() + 14_500);
    const handlers = waitingRoom(
      room({
        playerNames: ["Quiet River Baron", "Ann", "Bea", "Cy"],
        asking: { deadline, acceptedNames: ["Quiet River Baron", "Bea"] },
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "The room is full: accept the game?" });
    expect(within(dialog).getByRole("timer").textContent).toContain(
      "0:14 left to accept. The game starts when all 4 players accept.",
    );
    expect(dialog.textContent).toContain("Accepted so far: Quiet River Baron, Bea");
    fireEvent.click(within(dialog).getByRole("button", { name: "Accept" }));
    expect(handlers.onAccept).toHaveBeenCalled();
  });
});

function cleanUpAndShowAsOwner() {
  document.body.innerHTML = "";
  waitingRoom(room({ ownerName: "Ann", playerNames: ["Ann", "Bea", "Cy"] }));
}
