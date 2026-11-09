import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { GameResult } from "../../../shared/GameResult";
import type { RoomView } from "../../../shared/protocol/RoomView";
import { RoomCode } from "../../../shared/RoomCode";
import { NO_ROOM_CHAT } from "../../store/NO_ROOM_CHAT";
import { testAccount } from "../../testing/testAccount";
import { RoomAfterGamePage } from "./RoomAfterGamePage";

const RESULT: GameResult = {
  endedBy: "end_goal",
  places: ([2, 1, 3] as const).map((seat) => ({
    seat,
    score: 600 - seat * 50,
    bonusTypePoints: 4,
    hasLeft: false,
    hasReachedEndGoal: seat === 2,
    income: 22,
    fundsAndHand: 10,
  })),
};

function endedRoom(changes: Partial<RoomView> = {}): RoomView {
  return {
    code: v.parse(RoomCode, "K7QR2P"),
    size: 4,
    isPublic: true,
    ownerName: "Ann",
    playerNames: ["Ann", "Bea", "Cy"],
    namesInRoom: ["Ann", "Bea"],
    myName: "Ann",
    mySeat: 1,
    asking: null,
    deletionAt: v.parse(EpochMs, Date.now() + 3_600_000),
    ...changes,
  };
}

function roomAfterGame(room: RoomView, result: GameResult = RESULT) {
  const handlers = {
    onLeave: vi.fn(),
    onAskRematch: vi.fn(),
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    onDismissToast: vi.fn(),
  };
  render(
    <RoomAfterGamePage
      room={room}
      myName="Ann"
      account={testAccount({ name: "Ann" })}
      result={result}
      turn={20}
      viewer={1}
      chat={{
        chat: NO_ROOM_CHAT,
        onSend: vi.fn(),
        onMute: vi.fn(),
        onUnmute: vi.fn(),
        onSeen: vi.fn(),
      }}
      rejection={null}
      toast={null}
      {...handlers}
    />,
  );
  return handlers;
}

describe("the room after a game", () => {
  it("shows the result, the players still in the room and when the room is deleted", () => {
    roomAfterGame(endedRoom());
    expect(screen.getByText("Game over · Bea won with 500 points")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Players still in the room · 2" })).toBeDefined();
    const players = screen.getByRole("list", { name: "Players in the room" });
    expect(within(players).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByRole("group", { name: "Room size" })).toBeNull();
    expect(screen.queryByText(/Free place/)).toBeNull();
    expect(
      screen.getByText(/deleted when the last player leaves, or at \d\d:\d\d (today|tomorrow)/),
    ).toBeDefined();
  });

  it("says when the game was abandoned", () => {
    roomAfterGame(endedRoom(), { endedBy: "abandoned_by_vote", places: [] });
    expect(screen.getByText("Game over · abandoned with no winner")).toBeDefined();
  });

  it("opens the end-of-game screen again with Show result and closes it", () => {
    roomAfterGame(endedRoom());
    fireEvent.click(screen.getByRole("button", { name: "Show result" }));
    const dialog = screen.getByRole("dialog", { name: "Bea wins!" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks for a rematch and leaves the room", () => {
    const handlers = roomAfterGame(endedRoom());
    fireEvent.click(screen.getByRole("button", { name: "Ask for a rematch" }));
    expect(handlers.onAskRematch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Leave room" }));
    expect(handlers.onLeave).toHaveBeenCalledTimes(1);
  });

  it("disables Ask for a rematch with fewer than 2 players in the room", () => {
    roomAfterGame(endedRoom({ namesInRoom: ["Ann"] }));
    expect(screen.getByRole("button", { name: "Ask for a rematch" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("shows the rematch dialog with the time left and who has accepted", () => {
    const deadline = v.parse(EpochMs, Date.now() + 16_500);
    const handlers = roomAfterGame(
      endedRoom({ asking: { deadline, acceptedNames: ["Bea"], hasAccepted: false } }),
    );
    const dialog = screen.getByRole("dialog", { name: "Accept a rematch?" });
    expect(within(dialog).getByRole("timer").textContent).toContain(
      "left to accept. A new casual game starts from the beginning when all 2 players in the room accept.",
    );
    expect(dialog.textContent).toContain("Accepted so far: Bea");
    expect(dialog.textContent).toContain("no game starts and the room stays as it is");
    fireEvent.click(within(dialog).getByRole("button", { name: "Accept" }));
    expect(handlers.onAccept).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole("button", { name: "Decline" }));
    expect(handlers.onDecline).toHaveBeenCalledTimes(1);
  });
});
