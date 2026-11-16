import type { SeatNumber } from "../shared/SeatNumber";
import { claimAll } from "./claimAll";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { readyCombosOf } from "./readyCombosOf";
import { seatOf } from "./seatOf";
import { takeIncome } from "./takeIncome";
import { takeTurnDraw } from "./takeTurnDraw";
import { updateSeat } from "./updateSeat";

function withOpenTurnDrawTaken(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  if (seatOf(state, seat)?.isTurnDrawOpen !== true) {
    return state;
  }
  const choice = { option: "B", sector: random.pickSector() } as const;
  return takeTurnDraw(state, { type: "turn_draw", seat, choice }, random, at);
}

function withReadyCombosClaimed(state: GameState, seat: SeatNumber, random: Random): GameState {
  const current = seatOf(state, seat);
  if (current === undefined || readyCombosOf(current).length === 0) {
    return state;
  }
  const claimed = updateSeat(state, seat, (before) => ({
    ...claimAll(before),
    actionsThisTurn: before.actionsThisTurn,
  }));
  return takeIncome(claimed, seat, random);
}

export function settleBeforeDone(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  return withReadyCombosClaimed(withOpenTurnDrawTaken(state, seat, random, at), seat, random);
}
