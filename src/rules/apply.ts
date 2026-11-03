import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { claimAll } from "./claimAll";
import { completeProject } from "./completeProject";
import { completeQuest } from "./completeQuest";
import { dueTimeOuts } from "./dueTimeOuts";
import { endTurn } from "./endTurn";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { pauseGame } from "./pauseGame";
import { playCard } from "./playCard";
import type { Random } from "./Random";
import type { SystemAction } from "./SystemAction";
import { isSystemAction } from "./isSystemAction";
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
import { withUndoHistory } from "./withUndoHistory";

function accepted(state: GameState, action: GameAction, random: Random, at: number): GameState {
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
      return endTurn(state, action.seat, random, { at, isTimeOut: false });
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
    case "time_out":
      return timeOut(state, action.seat, random, at);
    case "pause_game":
      return pauseGame(state, action.seat, at);
    case "resume_game":
      return resumeGame(state, at);
  }
}

function systemRejectionOf(state: GameState, action: SystemAction, at: number) {
  const isAllowed =
    action.type === "resume_game"
      ? state.pause !== null
      : dueTimeOuts(state, at).includes(action.seat);
  return isAllowed ? undefined : "not_this_step";
}

function withGraceKept(before: GameState, after: GameState): GameState {
  const isSameClock =
    after.clockStartedAt === before.clockStartedAt || before.pause !== null;
  return after.grace === null || isSameClock ? after : { ...after, grace: null };
}

export function apply(
  state: GameState,
  action: GameAction,
  random: Random,
  at: number,
): Result<GameState, Rejection> {
  const code = isSystemAction(action)
    ? systemRejectionOf(state, action, at)
    : rejectionOf(state, action);
  if (code !== undefined) {
    return { isOk: false, error: { code } };
  }
  const next = withGraceKept(state, accepted(state, action, random, at));
  return { isOk: true, value: withUndoHistory(state, action, next) };
}
