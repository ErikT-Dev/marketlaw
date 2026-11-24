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
import { redrawStartingHand } from "./redrawStartingHand";
import { resumeGame } from "./resumeGame";
import { sellCards } from "./sellCards";
import { takeIncome } from "./takeIncome";
import { takeTurnDraw } from "./takeTurnDraw";
import { timeOut } from "./timeOut";
import { undoLatestAction } from "./undoLatestAction";
import { updateSeat } from "./updateSeat";
import { useDrawAction } from "./useDrawAction";
import { useTrade } from "./useTrade";
import type { VoteAction } from "./VoteAction";
import { voteDeadlineOf } from "./voteDeadlineOf";
import { withMainPhaseLogEntry } from "./withMainPhaseLogEntry";
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

type IncomeAction = Extract<
  GameAction,
  {
    readonly type:
      | "play_card"
      | "sell"
      | "claim_all"
      | "complete_project"
      | "complete_quest"
      | "influence"
      | "draw_action";
  }
>;

const INCOME_ACTIONS: ReadonlyArray<GameAction["type"]> = [
  "play_card",
  "sell",
  "claim_all",
  "complete_project",
  "complete_quest",
  "influence",
  "draw_action",
];

function isIncomeAction(action: GameAction): action is IncomeAction {
  return INCOME_ACTIONS.includes(action.type);
}

function changedBeforeIncome(state: GameState, action: IncomeAction, random: Random): GameState {
  switch (action.type) {
    case "play_card":
      return updateSeat(state, action.seat, (seat) => playCard(seat, action.card));
    case "sell":
      return sellCards(state, action.seat, action.cards);
    case "claim_all":
      return updateSeat(state, action.seat, claimAll);
    case "complete_project":
      return completeProject(state, action.seat, action.project, random);
    case "complete_quest":
      return completeQuest(state, action.seat, action.quest, random);
    case "influence":
      return updateSeat(state, action.seat, (seat) => useTrade(seat, action.trade));
    case "draw_action":
      return useDrawAction(state, action, random);
  }
}

function accepted(state: GameState, action: GameAction, random: Random, at: number): GameState {
  if (isSystemAction(action)) {
    return acceptedSystemAction(state, action, random, at);
  }
  if (isVoteAction(action)) {
    return acceptedVoteAction(state, action, at);
  }
  if (isIncomeAction(action)) {
    return takeIncome(changedBeforeIncome(state, action, random), action.seat, random);
  }
  switch (action.type) {
    case "end_turn":
      return endTurn(state, action.seat, random, at);
    case "undo":
      return undoLatestAction(state, action.seat);
    case "redraw_hand":
      return redrawStartingHand(state, action.seat, random);
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
  const next = withGraceKept(
    state,
    withMainPhaseLogEntry(action, accepted(state, action, random, at)),
  );
  return { isOk: true, value: withUndoHistory(state, action, next) };
}
