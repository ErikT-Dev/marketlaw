import { fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { GameResult } from "../../../shared/GameResult";
import type { VoteView } from "../../../shared/VoteView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function openVote(changes: Partial<VoteView>): VoteView {
  return {
    caller: 3,
    deadline: v.parse(EpochMs, Date.now() + 48_000),
    answered: 1,
    of: 2,
    hasToAnswer: true,
    ...changes,
  };
}

const ABANDONED_BY_VOTE: GameResult = { endedBy: "abandoned_by_vote", places: [] };

describe("calling an abandon vote", () => {
  it("explains the vote before calling it, and cancelling sends nothing", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(<GamePage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Vote to abandon" }));
    const dialog = screen.getByRole("dialog", { name: "Call a vote to abandon the game?" });
    expect(dialog.textContent).toContain("Every other player still in the game gets 1 minute");
    expect(dialog.textContent).toContain("Anyone who does not answer counts as no.");
    expect(dialog.textContent).toContain("A game can have one vote every 5 turns.");
    expect(dialog.textContent).toContain("All clocks keep running during the vote.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(props.onAction).not.toHaveBeenCalled();
  });

  it("sends call_vote when the player confirms", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(<GamePage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Vote to abandon" }));
    fireEvent.click(screen.getByRole("button", { name: "Call the vote" }));
    expect(props.onAction).toHaveBeenCalledWith({ type: "call_vote" });
  });

  it("cannot call a vote while one is open or once the game is over", () => {
    const { rerender } = render(
      <GamePage {...gamePageProps(roomUpdateWith({ vote: openVote({ hasToAnswer: false }) }))} />,
    );
    expect(screen.getByRole("button", { name: "Vote to abandon" })).toHaveProperty(
      "disabled",
      true,
    );
    rerender(
      <GamePage
        {...gamePageProps(roomUpdateWith({ phase: "ended", result: ABANDONED_BY_VOTE }))}
      />,
    );
    expect(screen.queryByRole("button", { name: "Vote to abandon" })).toBeNull();
  });

  it("says when the next vote is possible when a vote is called too soon", () => {
    const props = gamePageProps(roomUpdateWith({ nextVoteTurn: 8 }), [], {
      action: { type: "call_vote" },
      code: "vote_too_soon",
    });
    render(<GamePage {...props} />);
    expect(screen.getByRole("alert").textContent).toContain("Next vote possible in turn 8.");
  });
});

describe("answering an abandon vote", () => {
  it("asks with the caller, the time left and how many players have answered", () => {
    const props = gamePageProps(roomUpdateWith({ vote: openVote({}) }));
    render(<GamePage {...props} />);
    const dialog = screen.getByRole("dialog", { name: "Abandon the game?" });
    expect(dialog.textContent).toContain("Cy called a vote to abandon the game.");
    expect(dialog.textContent).toContain("Not answering counts as no.");
    expect(within(dialog).getByRole("timer").textContent).toMatch(/^0:4\d left to answer\.$/);
    expect(dialog.textContent).toContain("1 of 2 players answered");
    fireEvent.click(within(dialog).getByRole("button", { name: "Yes, abandon" }));
    expect(props.onAction).toHaveBeenCalledWith({ type: "vote", vote: "yes" });
  });

  it("sends a no answer and hides the dialog while the answer is pending", () => {
    const update = roomUpdateWith({ vote: openVote({}) });
    const props = gamePageProps(update);
    const { rerender } = render(<GamePage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "No, keep playing" }));
    expect(props.onAction).toHaveBeenCalledWith({ type: "vote", vote: "no" });
    rerender(
      <GamePage {...gamePageProps(update, [{ id: "a1", action: { type: "vote", vote: "no" } }])} />,
    );
    expect(screen.queryByRole("dialog", { name: "Abandon the game?" })).toBeNull();
  });

  it("shows the caller and players who answered how many have answered", () => {
    render(
      <GamePage
        {...gamePageProps(roomUpdateWith({ vote: openVote({ caller: 2, hasToAnswer: false }) }))}
      />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("You called a vote. 1 of 2 players answered");
  });
});

describe("the end of an abandon vote", () => {
  it("says the game goes on and when the next vote is possible when a vote fails", () => {
    const { rerender } = render(
      <GamePage {...gamePageProps(roomUpdateWith({ vote: openVote({ hasToAnswer: false }) }))} />,
    );
    rerender(<GamePage {...gamePageProps(roomUpdateWith({ vote: null, nextVoteTurn: 8 }))} />);
    const message = screen.getByRole("status");
    expect(message.textContent).toContain("The game goes on");
    expect(message.textContent).toContain(
      "Not every player voted yes to abandon the game. The next vote is possible in turn 8.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close: The game goes on" }));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows the abandoned end screen with no table when a vote passes", () => {
    const { rerender } = render(
      <GamePage {...gamePageProps(roomUpdateWith({ vote: openVote({ hasToAnswer: false }) }))} />,
    );
    rerender(
      <GamePage
        {...gamePageProps(
          roomUpdateWith({ vote: null, phase: "ended", result: ABANDONED_BY_VOTE }),
        )}
      />,
    );
    const ended = screen.getByRole("dialog", { name: "The game was abandoned" });
    expect(ended.textContent).toContain("All players voted yes, so the game ended with no winner.");
    expect(within(ended).queryByRole("table")).toBeNull();
    expect(screen.queryByText("The game goes on")).toBeNull();
  });
});
