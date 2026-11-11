import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as v from "valibot";
import { EpochMs } from "../../../shared/EpochMs";
import type { ChatEntry } from "../../../shared/protocol/ChatEntry";
import { NO_ROOM_CHAT } from "../../store/NO_ROOM_CHAT";
import type { RoomChat } from "../../store/RoomChat";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import type { ChatBinding } from "./ChatBinding";
import { RoomChatSection } from "./RoomChatSection";
import { testPlayerIdOf } from "../../testing/testPlayerIdOf";

const AT = v.parse(EpochMs, Date.UTC(2026, 10, 6, 14, 2));

const ENTRIES: ReadonlyArray<ChatEntry> = [
  { kind: "player_line", event: "joined_room", name: "Bea", at: AT },
  {
    kind: "message",
    from: "Bea",
    fromId: testPlayerIdOf(2),
    text: "Hello all",
    at: AT,
    isOwn: false,
  },
  {
    kind: "message",
    from: "Ann",
    fromId: testPlayerIdOf(1),
    text: "Income first for me.",
    at: AT,
    isOwn: true,
  },
  { kind: "game_line", event: "game_started", at: AT },
];

function binding(entries: ReadonlyArray<ChatEntry>, unreadCount = 0): ChatBinding {
  return bindingOf({ ...NO_ROOM_CHAT, entries, unreadCount });
}

function bindingOf(chat: RoomChat): ChatBinding {
  return { chat, onSend: vi.fn(), onMute: vi.fn(), onUnmute: vi.fn(), onSeen: vi.fn() };
}

function refusedChat(code: "chat_too_fast" | "chat_room_limit", sendAgainAt: number | null) {
  const at = sendAgainAt === null ? null : v.parse(EpochMs, sendAgainAt);
  return { ...NO_ROOM_CHAT, refused: { code, sendAgainAt: at, text: "ok gl" } };
}

afterEach(() => {
  vi.useRealTimers();
});

function typeAndSend(text: string): void {
  const input = screen.getByRole("textbox", { name: "Message the room" });
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);
}

describe("the room chat", () => {
  it("shows messages with their sender and time, own messages as You, and grey lines", () => {
    render(<RoomChatSection binding={binding(ENTRIES)} />);
    const items = within(screen.getByRole("list", { name: "Chat messages" })).getAllByRole(
      "listitem",
    );
    const localTime = new Date(AT).toTimeString().slice(0, 5);
    expect(items.map((item) => item.textContent)).toEqual([
      "Bea joined the room.",
      `Bea${localTime}MuteHello all`,
      `You${localTime}Income first for me.`,
      "The game started.",
    ]);
  });

  it("mutes the sender of another player's message", () => {
    const chat = binding(ENTRIES);
    render(<RoomChatSection binding={chat} />);
    fireEvent.click(screen.getByRole("button", { name: "Mute Bea" }));
    expect(chat.onMute).toHaveBeenCalledWith("Bea");
    expect(screen.queryByRole("button", { name: "Mute Ann" })).toBeNull();
  });

  it("counts characters as seen and sends the trimmed text on Enter", () => {
    const chat = binding([]);
    render(<RoomChatSection binding={chat} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Message the room" }), {
      target: { value: "  gl \u{1F44D}\u{1F3FD} " },
    });
    expect(screen.getByText("4 / 200")).toBeTruthy();
    typeAndSend("  gl \u{1F44D}\u{1F3FD} ");
    expect(chat.onSend).toHaveBeenCalledWith("gl \u{1F44D}\u{1F3FD}");
    expect(screen.getByText("0 / 200")).toBeTruthy();
  });

  it("never sends an empty message", () => {
    const chat = binding([]);
    render(<RoomChatSection binding={chat} />);
    typeAndSend(" \n ");
    expect(chat.onSend).not.toHaveBeenCalled();
  });

  it("marks the chat as read while it is on screen", () => {
    const chat = binding(ENTRIES, 2);
    render(<RoomChatSection binding={chat} />);
    expect(chat.onSeen).toHaveBeenCalled();
  });
});

describe("mutes and limits in the room chat", () => {
  it("lists muted players with Unmute", () => {
    const chat = bindingOf({ ...NO_ROOM_CHAT, mutedNames: ["Ann"] });
    render(<RoomChatSection binding={chat} />);
    const muted = screen.getByRole("list", { name: "Muted players" });
    expect(within(muted).getByText("You muted Ann")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Unmute Ann" }));
    expect(chat.onUnmute).toHaveBeenCalledWith("Ann");
  });

  it("says when the player can send again, counting down, and keeps the refused text", () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const view = render(<RoomChatSection binding={binding([])} />);
    view.rerender(<RoomChatSection binding={bindingOf(refusedChat("chat_too_fast", 12_000))} />);
    expect(screen.getByRole("textbox", { name: "Message the room" })).toHaveProperty(
      "value",
      "ok gl",
    );
    expect(
      screen.getByText("You can send 1 message every 2 seconds. Try again in 2 seconds."),
    ).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(
      screen.getByText("You can send 1 message every 2 seconds. Try again in 1 second."),
    ).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("says the room limit is reached without a countdown", () => {
    render(<RoomChatSection binding={bindingOf(refusedChat("chat_room_limit", null))} />);
    expect(screen.getByRole("status").textContent).toBe(
      "You have sent 100 messages in this room, the most per room.",
    );
  });
});

describe("the chat tab in a game", () => {
  it("shows the unread count until the chat tab is opened", () => {
    const chat = binding(ENTRIES, 2);
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} chat={chat} />);
    expect(screen.getByRole("tabpanel", { name: "Game log" })).toBeTruthy();
    expect(chat.onSeen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("tab", { name: "Chat, 2 new" }));
    expect(screen.getByRole("tab", { name: "Chat" }).getAttribute("aria-selected")).toBe("true");
    expect(
      within(screen.getByRole("tabpanel", { name: "Chat" })).getByText("Hello all"),
    ).toBeTruthy();
    expect(chat.onSeen).toHaveBeenCalled();
  });
});
