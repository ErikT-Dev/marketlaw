import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import type { GameResult } from "../../shared/GameResult";
import type { ChatEntry } from "../../shared/protocol/ChatEntry";
import { RoomCode } from "../../shared/RoomCode";
import { NO_ROOM_CHAT } from "../store/NO_ROOM_CHAT";
import { gamePageProps } from "../testing/gamePageProps";
import { roomUpdateWith } from "../testing/roomUpdateWith";
import { testPlayerIdOf } from "../testing/testPlayerIdOf";
import { RoomChatSection } from "./chat/RoomChatSection";
import { GameOverTable } from "./game/GameOverTable";
import { GamePage } from "./GamePage";
import { PublicRoomsList } from "./lobby/PublicRoomsList";
import { WaitingPlayers } from "./lobby/WaitingPlayers";

const RESULT: GameResult = {
  endedBy: "end_goal",
  places: ([3, 2, 1] as const).map((seat) => ({
    seat,
    score: 600 - seat * 50,
    bonusTypePoints: 4,
    leftInTurn: null,
    hasReachedEndGoal: false,
    income: 22,
    fundsAndHand: 10,
  })),
};

function historyOf(number: number): string {
  return `#history/${testPlayerIdOf(number)}`;
}

function hrefOf(link: HTMLElement): string | null {
  return link.getAttribute("href");
}

describe("usernames that open match histories", () => {
  it("links every player badge in the player order to that player's match history", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    const order = within(screen.getByRole("list", { name: "Player order" }));
    expect(hrefOf(order.getByRole("link", { name: "Ann" }))).toBe(historyOf(1));
    expect(hrefOf(order.getByRole("link", { name: "Di" }))).toBe(historyOf(4));
  });

  it("links an opponent card's username while the rest of the card still opens the board", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    const cy = within(screen.getByRole("article", { name: "Cy" }));
    expect(hrefOf(cy.getByRole("link", { name: "Cy" }))).toBe(historyOf(3));
    fireEvent.click(cy.getByRole("button", { name: "See Cy's board ›" }));
    const board = within(screen.getByRole("dialog", { name: "Cy's board" }));
    expect(hrefOf(board.getByRole("link", { name: "Cy" }))).toBe(historyOf(3));
  });

  it("links the other players in the end-of-game table but not the viewer", () => {
    render(
      <GameOverTable
        result={RESULT}
        viewer={2}
        playerNames={["Ann", "Bea", "Cy"]}
        playerIds={[1, 2, 3].map(testPlayerIdOf)}
      />,
    );
    expect(hrefOf(screen.getByRole("link", { name: "Cy" }))).toBe(historyOf(3));
    expect(hrefOf(screen.getByRole("link", { name: "Ann" }))).toBe(historyOf(1));
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("links the sender of another player's chat message but not your own", () => {
    const at = v.parse(EpochMs, Date.UTC(2026, 10, 6, 14, 2));
    const entries: ReadonlyArray<ChatEntry> = [
      { kind: "player_line", event: "joined_room", name: "Cy", at },
      { kind: "message", from: "Bea", fromId: testPlayerIdOf(2), text: "Hi", at, isOwn: false },
      { kind: "message", from: "Ann", fromId: testPlayerIdOf(1), text: "Yo", at, isOwn: true },
    ];
    const binding = {
      chat: { ...NO_ROOM_CHAT, entries },
      onSend: vi.fn(),
      onMute: vi.fn(),
      onUnmute: vi.fn(),
      onSeen: vi.fn(),
    };
    render(<RoomChatSection binding={binding} />);
    expect(screen.getAllByRole("link").map(hrefOf)).toEqual([historyOf(2)]);
    expect(screen.getByRole("link", { name: "Bea" })).toBeDefined();
  });

  it("links the players of a public room", () => {
    const room = {
      code: v.parse(RoomCode, "K7QR2P"),
      size: 4,
      ownerName: "Oli",
      playerNames: ["Oli", "Sam"],
      playerIds: [5, 6].map(testPlayerIdOf),
    };
    render(<PublicRoomsList rooms={[room]} onJoin={vi.fn()} />);
    expect(hrefOf(screen.getByRole("link", { name: "Sam" }))).toBe(historyOf(6));
    expect(hrefOf(screen.getByRole("link", { name: "Oli" }))).toBe(historyOf(5));
  });

  it("links the other players in the waiting room and after the game but not yourself", () => {
    const { room } = roomUpdateWith({});
    const { unmount } = render(<WaitingPlayers room={room} myName="Bea" isAfterGame={false} />);
    expect(screen.getAllByRole("link").map(hrefOf)).toEqual([1, 3, 4].map(historyOf));
    unmount();
    const afterGame = {
      ...room,
      namesInRoom: ["Bea", "Di"],
      idsInRoom: [2, 4].map(testPlayerIdOf),
    };
    render(<WaitingPlayers room={afterGame} myName="Bea" isAfterGame />);
    expect(screen.getAllByRole("link").map(hrefOf)).toEqual([historyOf(4)]);
  });
});
