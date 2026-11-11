import type { MainPhaseLogEntry } from "../shared/MainPhaseLogEntry";
import type { GameAction } from "./GameAction";

type LoggedAction = Extract<
  GameAction,
  { readonly type: "play_card" | "complete_quest" | "complete_project" | "influence" }
>;

const LOGGED_ACTIONS: ReadonlyArray<GameAction["type"]> = [
  "play_card",
  "complete_quest",
  "complete_project",
  "influence",
];

function isLoggedAction(action: GameAction): action is LoggedAction {
  return LOGGED_ACTIONS.includes(action.type);
}

function entryOf(action: LoggedAction, turn: number): MainPhaseLogEntry {
  switch (action.type) {
    case "play_card":
      return { kind: "played", turn, seat: action.seat, card: action.card };
    case "complete_quest":
      return { kind: "completed_quest", turn, seat: action.seat, quest: action.quest };
    case "complete_project":
      return { kind: "completed_project", turn, seat: action.seat, project: action.project };
    case "influence":
      return { kind: "influence", turn, seat: action.seat, trade: action.trade };
  }
}

export function mainPhaseLogEntryOf(action: GameAction, turn: number): MainPhaseLogEntry | null {
  return isLoggedAction(action) ? entryOf(action, turn) : null;
}
