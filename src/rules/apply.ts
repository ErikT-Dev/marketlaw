import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { abandonPausedGame } from "./abandonPausedGame";
import { answerVote } from "./answerVote";
import { callVote } from "./callVote";
import { closeVote } from "./closeVote";
import { claimAll } from "./claimAll";
import { completeProject } from "./completeProject";
import { completeQuest } from "./completeQuest";
import type { SeatNumber } from "../shared/SeatNumber";
import { decisionOf } from "./decisionOf";
import { dueTimeOuts } from "./dueTimeOuts";
import { endTurn } from "./endTurn";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { leaveGame } from "./leaveGame";
import { pauseGame } from "./pauseGame";
import { pausedAbandonDeadline } from "./pausedAbandonDeadline";
import { playCard } from "./playCard";
import type { Random } from "./Random";
import type { SystemAction } from "./SystemAction";
import { isSystemAction } from "./isSystemAction";
import { isVoteAction } from "./isVoteAction";
import { rejectionOf } from "./rejectionOf";
import { resumeGame } from "./resumeGame";
import { sellCards } from "./sellCards";
import { takeIncome } from "./takeIncome";
import { takeTurnDraw } from "./takeTurnDraw";
import { timeOut } from "./timeOut";
import { undoLatest } from "./undoLatest";
import { updateSeat } from "./updateSeat";
import { useDrawAction } from "./useDrawAction";
import { useTrade } from "./useTrade";
import type { VoteAction } from "./VoteAction";
import { voteDeadlineOf } from "./voteDeadlineOf";
import { withUndoHistory } from "./withUndoHistory";

function acceptedSystemAction(
  state: GameState,
  action: SystemAction,
  random: Random,
  at: number,
): GameState {
  switch (action.type) {
    case "time_out":
      return timeOut(state, action.seat, random, at);
    case "pause_game":
      return pauseGame(state, at);
    case "resume_game":
      return resumeGame(state, at);
    case "abandon_game":
      return abandonPausedGame(state, at);
    case "close_vote":
      return closeVote(state, at);
  }
}

function acceptedVoteAction(state: GameState, action: VoteAction, at: number): GameState {
  return action.type === "call_vote"
    ? callVote(state, action.seat, at)
    : answerVote(state, action.seat, action.answer, at);
}

function accepted(state: GameState, action: GameAction, random: Random, at: number): GameState {
  if (isSystemAction(action)) {
    return acceptedSystemAction(state, action, random, at);
  }
  if (isVoteAction(action)) {
    return acceptedVoteAction(state, action, at);
  }
  switch (action.type) {
    case "play_card":
      return takeIncome(
        updateSeat(state, action.seat, (seat) => playCard(seat, action.card)),
        action.seat,
        random,
      );
    case "sell":
      return takeIncome(sellCards(state, action.seat, action.cards), action.seat, random);
    case "end_turn":
      return endTurn(state, action.seat, random, at);
    case "claim_all":
      return takeIncome(updateSeat(state, action.seat, claimAll), action.seat, random);
    case "complete_project":
      return takeIncome(
        completeProject(state, action.seat, action.project, random),
        action.seat,
        random,
      );
    case "complete_quest":
      return takeIncome(
        completeQuest(state, action.seat, action.quest, random),
        action.seat,
        random,
      );
    case "influence":
      return takeIncome(
        updateSeat(state, action.seat, (seat) => useTrade(seat, action.trade)),
        action.seat,
        random,
      );
    case "draw_action":
      return takeIncome(useDrawAction(state, action, random), action.seat, random);
    case "undo":
      return updateSeat(state, action.seat, undoLatest);
    case "turn_draw":
      return takeTurnDraw(state, action, random, at);
    case "leave_game":
      return leaveGame(state, action.seat, random, at);
  }
}

function isSystemActionDue(state: GameState, action: SystemAction, at: number): boolean {
  switch (action.type) {
    case "resume_game":
      return state.pause !== null;
    case "abandon_game": {
      const deadline = pausedAbandonDeadline(state);
      return deadline !== null && deadline <= at;
    }
    case "close_vote": {
      const deadline = voteDeadlineOf(state);
      return deadline !== null && deadline <= at;
    }
    case "time_out":
    case "pause_game":
      return dueTimeOuts(state, at).includes(action.seat);
  }
}

function systemRejectionOf(state: GameState, action: SystemAction, at: number) {
  return isSystemActionDue(state, action, at) ? undefined : "not_this_step";
}

function isSameDecision(before: GameState, after: GameState, seat: SeatNumber): boolean {
  const startedAt = decisionOf(after, seat)?.startedAt;
  return startedAt !== undefined && startedAt === decisionOf(before, seat)?.startedAt;
}

function withGraceKept(before: GameState, after: GameState): GameState {
  if (before.pause !== null) {
    return after;
  }
  const grace = after.grace.filter(({ seat }) => isSameDecision(before, after, seat));
  return grace.length === after.grace.length ? after : { ...after, grace };
}

export function apply(
  state: GameState,
  action: GameAction,
  random: Random,
  at: number,
): Result<GameState, Rejection> {
  const code = isSystemAction(action)
    ? systemRejectionOf(state, action, at)
    : state.pause === null
      ? rejectionOf(state, action)
      : "not_this_step";
  if (code !== undefined) {
    return { isOk: false, error: { code } };
  }
  const next = withGraceKept(state, accepted(state, action, random, at));
  return { isOk: true, value: withUndoHistory(state, action, next) };
}
