import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyDueTimeOuts } from "./applyDueTimeOuts";
import { earliestDeadline } from "./earliestDeadline";
import type { GameAction } from "./GameAction";
import { invariantViolations } from "./invariantViolations";
import { randomForNextAction } from "./randomForNextAction";
import { receiveAction } from "./receiveAction";
import type { SavedGame } from "./SavedGame";
import { seatOf } from "./seatOf";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

const CALLED_AT = 10_000;
const VOTE_DEADLINE = CALLED_AT + 60_000;

function received(saved: SavedGame, action: GameAction, at = CALLED_AT): SavedGame {
  const result = receiveAction(saved, action, at, randomForNextAction);
  if (result.rejection !== null) {
    throw new Error(`${action.type} rejected: ${result.rejection.code}`);
  }
  return result.saved;
}

function rejectionOfAction(saved: SavedGame, action: GameAction, at = CALLED_AT) {
  return receiveAction(saved, action, at, randomForNextAction).rejection?.code;
}

function gameWithVote(players: 2 | 3 | 4 = 3): SavedGame {
  const started = startSavedGame({ players, kind: "casual", startedAt: GAME_STARTED_AT }, 7);
  return received(started, { type: "call_vote", seat: 1 });
}

describe("an abandon vote", () => {
  it("makes its deadline the room's next deadline when it comes first", () => {
    expect(earliestDeadline(gameWithVote().state)).toBe(VOTE_DEADLINE);
  });

  it("stays open just before its minute is over", () => {
    const later = applyDueTimeOuts(gameWithVote(), VOTE_DEADLINE - 1, randomForNextAction);
    expect(later.state.vote).not.toBeNull();
  });

  it("fails when its minute is over and logs the closing as a system action", () => {
    const answered = received(gameWithVote(), { type: "vote", seat: 2, answer: "yes" });
    const later = applyDueTimeOuts(answered, VOTE_DEADLINE, randomForNextAction);
    expect(later.state.vote).toBeNull();
    expect(later.state.phase).toBe("main");
    expect(later.state.lastVoteTurn).toBe(1);
    expect(later.actionLog.at(-1)).toEqual({
      action: { type: "close_vote", seat: 1 },
      at: VOTE_DEADLINE,
    });
  });

  it("closes a vote whose minute is over before taking a late answer", () => {
    const late = receiveAction(
      gameWithVote(),
      { type: "vote", seat: 2, answer: "yes" },
      VOTE_DEADLINE + 5,
      randomForNextAction,
    );
    expect(late.rejection?.code).toBe("no_vote_open");
    expect(late.saved.state.vote).toBeNull();
  });

  it("passes with every answer yes and ends the game with no winner", () => {
    const first = received(gameWithVote(), { type: "vote", seat: 2, answer: "yes" });
    const ended = received(first, { type: "vote", seat: 3, answer: "yes" });
    expect(ended.state.phase).toBe("ended");
    expect(ended.state.result?.endedBy).toBe("abandoned_by_vote");
    expect(ended.state.vote).toBeNull();
    expect(earliestDeadline(ended.state)).toBeNull();
  });

  it("shows each player the count and whether they still have to answer, never the answers", () => {
    const answered = received(gameWithVote(4), { type: "vote", seat: 2, answer: "no" });
    const seen = ([1, 2, 3] as const).map((seat) => viewFor(answered.state, seat));
    expect(seen.map((view) => view.vote)).toEqual([
      { caller: 1, deadline: VOTE_DEADLINE, answered: 1, of: 3, hasToAnswer: false },
      { caller: 1, deadline: VOTE_DEADLINE, answered: 1, of: 3, hasToAnswer: false },
      { caller: 1, deadline: VOTE_DEADLINE, answered: 1, of: 3, hasToAnswer: true },
    ]);
    expect(JSON.stringify(seen)).not.toContain('"no"');
  });

  it("shows the next turn a vote can be called", () => {
    expect(viewFor(gameWithVote().state, 2).nextVoteTurn).toBe(6);
  });

  it("takes an answer from a player who is done this turn", () => {
    const done = received(gameWithVote(), { type: "end_turn", seat: 2 });
    const answered = received(done, { type: "vote", seat: 2, answer: "yes" });
    expect(answered.state.vote?.ballots).toEqual([{ seat: 2, answer: "yes" }]);
  });

  it("keeps the undo of the player who answers", () => {
    const started = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 7);
    const traded = received(started, { type: "influence", seat: 2, trade: "fund_to_influence" });
    const called = received(traded, { type: "call_vote", seat: 1 });
    const answered = received(called, { type: "vote", seat: 2, answer: "no" });
    expect(seatOf(answered.state, 2)?.undoPoints).toHaveLength(1);
  });

  it("rejects an answer from a player who left", () => {
    const left = received(gameWithVote(), { type: "leave_game", seat: 3 });
    expect(rejectionOfAction(left, { type: "vote", seat: 3, answer: "yes" })).toBe("not_in_game");
  });

  it("closes when the last player still asked leaves", () => {
    const answered = received(gameWithVote(4), { type: "vote", seat: 2, answer: "no" });
    const yes = received(answered, { type: "vote", seat: 3, answer: "yes" });
    const left = received(yes, { type: "leave_game", seat: 4 });
    expect(left.state.vote).toBeNull();
    expect(left.state.phase).toBe("main");
  });

  it("keeps the count shown when a player who answered leaves", () => {
    const answered = received(gameWithVote(4), { type: "vote", seat: 2, answer: "no" });
    const left = received(answered, { type: "leave_game", seat: 2 });
    expect(viewFor(left.state, 3).vote).toEqual({
      caller: 1,
      deadline: VOTE_DEADLINE,
      answered: 1,
      of: 3,
      hasToAnswer: true,
    });
  });

  it("no longer counts the answer of a player who left towards the result", () => {
    const answered = received(gameWithVote(4), { type: "vote", seat: 2, answer: "no" });
    const left = received(answered, { type: "leave_game", seat: 2 });
    const yes = received(left, { type: "vote", seat: 3, answer: "yes" });
    const ended = received(yes, { type: "vote", seat: 4, answer: "yes" });
    expect(ended.state.result?.endedBy).toBe("abandoned_by_vote");
  });

  it("stays open and can pass when the player who called it leaves", () => {
    const left = received(gameWithVote(4), { type: "leave_game", seat: 1 });
    expect(viewFor(left.state, 2).vote).toEqual({
      caller: 1,
      deadline: VOTE_DEADLINE,
      answered: 0,
      of: 3,
      hasToAnswer: true,
    });
    const answers = ([2, 3, 4] as const).reduce(
      (current, seat) => received(current, { type: "vote", seat, answer: "yes" }),
      left,
    );
    expect(answers.state.result?.endedBy).toBe("abandoned_by_vote");
  });

  it("still closes at its deadline when the player who called it left", () => {
    const left = received(gameWithVote(4), { type: "leave_game", seat: 1 });
    const later = applyDueTimeOuts(left, VOTE_DEADLINE, randomForNextAction);
    expect(later.state.vote).toBeNull();
    expect(later.state.phase).toBe("main");
  });

  it("is cleared when the game ends another way", () => {
    const ended = received(gameWithVote(2), { type: "leave_game", seat: 2 });
    expect(ended.state.result?.endedBy).toBe("last_player");
    expect(ended.state.vote).toBeNull();
  });

  it("breaks no invariant when a done player answers", () => {
    const done = received(gameWithVote(), { type: "end_turn", seat: 2 });
    const answered = received(done, { type: "vote", seat: 2, answer: "yes" });
    const action: GameAction = { type: "vote", seat: 2, answer: "yes" };
    expect(
      invariantViolations({
        before: done.state,
        beforeAsText: JSON.stringify(done.state),
        action,
        outcome: { isOk: true, value: answered.state },
      }),
    ).toEqual([]);
  });
});
