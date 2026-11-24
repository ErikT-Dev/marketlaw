import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testRankedQueue } from "../../testing/testRankedQueue";
import { EpochMs } from "../../../shared/EpochMs";
import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import type { RoomView } from "../../../shared/protocol/RoomView";
import { RoomCode } from "../../../shared/RoomCode";
import { LobbyPage } from "./LobbyPage";
import { NO_ROOM_CHAT } from "../../store/NO_ROOM_CHAT";
import { testAccount } from "../../testing/testAccount";
import { WaitingRoomPage } from "./WaitingRoomPage";
import { testPlayerIdOf } from "../../testing/testPlayerIdOf";
import { TEST_PLAYER_ICON } from "../../../shared/testing/TEST_PLAYER_ICON";

async function succeed() {
  return Promise.resolve(null);
}

function lobby(changes: Partial<Parameters<typeof LobbyPage>[0]> = {}) {
  const onJoin = vi.fn();
  render(
    <LobbyPage
      account={testAccount({ name: "Ann" })}
      joinError={null}
      removal={null}
      onJoin={onJoin}
      onCreate={succeed}
      onStartAsGuest={succeed}
      onLogIn={succeed}
      onSignUp={succeed}
      onForgotPassword={vi.fn()}
      onDismissRemoval={vi.fn()}
      publicRooms={[]}
      playersOnline={[]}
      ranked={testRankedQueue()}
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
    playerIds: [1, 2, 3].map(testPlayerIdOf),
    playerIcons: [TEST_PLAYER_ICON, TEST_PLAYER_ICON, TEST_PLAYER_ICON],
    namesInRoom: ["Quiet River Baron", "Ann", "Bea"],
    idsInRoom: [1, 2, 3].map(testPlayerIdOf),
    myName: "Ann",
    mySeat: null,
    asking: null,
    deletionAt: null,
    ratings: null,
    ...changes,
  };
}

function waitingRoom(
  view: RoomView,
  hasSiteGameLimitNotice = false,
  playersOnline: ReadonlyArray<PlayerOnlineView> = [],
) {
  const handlers = {
    onChangeSize: vi.fn(),
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    onDismissSiteGameLimit: vi.fn(),
  };
  render(
    <WaitingRoomPage
      room={view}
      myName="Ann"
      account={testAccount({ name: "Ann" })}
      onLeave={vi.fn()}
      rejection={null}
      hasSiteGameLimitNotice={hasSiteGameLimitNotice}
      playersOnline={playersOnline}
      chat={{
        chat: NO_ROOM_CHAT,
        onSend: vi.fn(),
        onMute: vi.fn(),
        onUnmute: vi.fn(),
        onSeen: vi.fn(),
      }}
      {...handlers}
    />,
  );
  return handlers;
}

const ONLINE_BEA: PlayerOnlineView = {
  playerId: testPlayerIdOf(2),
  username: "Bea",
  rating: 987,
  status: "online",
};

const OWN_ACTION_LIMIT_TEXT =
  "You have used your 2,000 game actions for today. You can join rooms, the ranked queue and new games again after 00:00 UTC.";
const OWN_GAME_START_LIMIT_TEXT =
  "You have started 10 games today, the most per day. Try again after 00:00 UTC.";

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
    const { onJoin } = lobby({ account: null });
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

  it("shows the players online beside the public rooms", () => {
    lobby({ playersOnline: [ONLINE_BEA] });
    expect(screen.getByRole("heading", { name: "Players online · 1" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Bea" })).toBeDefined();
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

describe("the daily limit notices", () => {
  it("shows the daily action limit when joining a room fails for it", () => {
    lobby({ joinError: { code: "K7QR2P", reason: "daily_action_limit", rejoinAt: null } });
    expect(screen.getByRole("alert").textContent).toContain(OWN_ACTION_LIMIT_TEXT);
  });

  it("shows the daily game start limit when joining a room fails for it", () => {
    lobby({ joinError: { code: "K7QR2P", reason: "daily_game_start_limit", rejoinAt: null } });
    expect(screen.getByRole("alert").textContent).toContain(OWN_GAME_START_LIMIT_TEXT);
  });

  it("tells a player removed for their own daily limits why, without a rejoin wait", () => {
    lobby({ removal: { code: "K7QR2P", reason: "daily_action_limit", rejoinAt: null } });
    expect(screen.getByRole("status").textContent).toContain("Removed from room K7QR2P");
    expect(screen.getByRole("status").textContent).toContain(OWN_ACTION_LIMIT_TEXT);
    document.body.innerHTML = "";
    lobby({ removal: { code: "K7QR2P", reason: "daily_game_start_limit", rejoinAt: null } });
    expect(screen.getByRole("status").textContent).toContain(OWN_GAME_START_LIMIT_TEXT);
  });

  it("warns everyone in the waiting room when the site game limit stops the game", () => {
    const handlers = waitingRoom(room(), true);
    const toast = screen.getByRole("status");
    expect(toast.textContent).toContain("Daily game limit reached");
    expect(toast.textContent).toContain("Daily game limit reached, try again after 00:00 UTC");
    fireEvent.click(screen.getByRole("button", { name: "Close: Daily game limit reached" }));
    expect(handlers.onDismissSiteGameLimit).toHaveBeenCalled();
  });
});

describe("the public room list", () => {
  const rooms = [
    {
      code: v.parse(RoomCode, "K7QR2P"),
      size: 4,
      ownerName: "Quiet River Baron",
      playerNames: ["Quiet River Baron", "Bea"],
      playerIds: [1, 3].map(testPlayerIdOf),
    },
    {
      code: v.parse(RoomCode, "M4TX9C"),
      size: 2,
      ownerName: "Oli",
      playerNames: ["Oli", "Sam"],
      playerIds: [4, 5].map(testPlayerIdOf),
    },
  ];

  it("lists each public room with its players and free places, joined with one click", () => {
    const { onJoin } = lobby({ publicRooms: rooms });
    expect(screen.getByRole("heading", { name: "Public rooms · 2" })).toBeTruthy();
    const first = screen.getByRole("listitem", { name: "Quiet River Baron's room" });
    expect(first.textContent).toContain("2 of 4 players · 2 free");
    fireEvent.click(within(first).getByRole("button", { name: "Join" }));
    expect(onJoin).toHaveBeenCalledWith("K7QR2P");
    const full = screen.getByRole("listitem", { name: "Oli's room" });
    expect(within(full).getByRole("button", { name: "Join" })).toHaveProperty("disabled", true);
  });

  it("says so when there are no public rooms", () => {
    lobby({ publicRooms: [] });
    expect(screen.getByText("No public rooms right now")).toBeTruthy();
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

  it("keeps the players online list", () => {
    waitingRoom(room(), false, [ONLINE_BEA]);
    expect(screen.getByRole("heading", { name: "Players online · 1" })).toBeDefined();
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
        asking: { deadline, acceptedNames: ["Quiet River Baron", "Bea"], hasAccepted: false },
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

  it("shows Accepted when the room says this player has accepted, not when a name matches", () => {
    const deadline = v.parse(EpochMs, Date.now() + 14_500);
    waitingRoom(room({ asking: { deadline, acceptedNames: ["Bea"], hasAccepted: true } }));
    const accepted = screen.getByRole("button", { name: "Accepted" });
    expect(accepted).toHaveProperty("disabled", true);
    document.body.innerHTML = "";
    waitingRoom(room({ asking: { deadline, acceptedNames: ["Ann"], hasAccepted: false } }));
    expect(screen.getByRole("button", { name: "Accept" })).toHaveProperty("disabled", false);
  });
});

function cleanUpAndShowAsOwner() {
  document.body.innerHTML = "";
  waitingRoom(room({ ownerName: "Ann", playerNames: ["Ann", "Bea", "Cy"] }));
}
