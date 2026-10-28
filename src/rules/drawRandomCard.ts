import type { DrawCause } from "../shared/DrawCause";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawIntoHand } from "./drawIntoHand";
import type { GameState } from "./GameState";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";

export function drawRandomCard(
  state: GameState,
  seat: SeatNumber,
  cause: DrawCause,
  random: Random,
): GameState {
  const sector = random.pickSector();
  const tier = pickTier(tierChancesByTurn(state.turn), random);
  return drawIntoHand(state, { seat, cause, target: { by: "sector", sector }, tier }, random);
}
