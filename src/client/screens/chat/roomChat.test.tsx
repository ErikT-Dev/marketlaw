import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as v from "valibot";
import { EpochMs } from "../../../shared/EpochMs";
import type { ChatEntry } from "../../../shared/protocol/ChatEntry";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import type { ChatBinding } from "./ChatBinding";
import { RoomChatSection } from "./RoomChatSection";

const AT = v.parse(EpochMs, Date.UTC(2026, 10, 6, 14, 2));

const ENTRIES: ReadonlyArray<ChatEntry> = [
  { kind: "player_line", event: "joined_room", name: "Bea", at: AT },
  { kind: "message", from: "Bea", text: "Hello all", at: AT, isOwn: false },
  { kind: "message", from: "Ann", text: "Income first for me.", at: AT, isOwn: true },
  { kind: "game_line", event: "game_started", at: AT },
];

function binding(entries: ReadonlyArray<ChatEntry>, unreadCount = 0): ChatBinding {
  return {
    chat: { entries, mutedNames: [], unreadCount },
    onSend: vi.fn(),
    onMute: vi.fn(),
    onSeen: vi.fn(),
  };
}

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

describe("the chat tab in a game", () => {
  it("shows the unread count until the chat tab is opened", () => {
    const chat = binding(ENTRIES, 2);
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} chat={chat} />);
    expect(screen.getByRole("tabpanel", { name: "Draw log" })).toBeTruthy();
    expect(chat.onSeen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("tab", { name: "Chat, 2 new" }));
    expect(screen.getByRole("tab", { name: "Chat" }).getAttribute("aria-selected")).toBe("true");
    expect(
      within(screen.getByRole("tabpanel", { name: "Chat" })).getByText("Hello all"),
    ).toBeTruthy();
    expect(chat.onSeen).toHaveBeenCalled();
  });
});
