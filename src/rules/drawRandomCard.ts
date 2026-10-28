import type { DrawCause } from "../shared/DrawCause";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawCard } from "./drawCard";
import type { GameState } from "./GameState";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";
import { updateSeat } from "./updateSeat";

export function drawRandomCard(
  state: GameState,
  seat: SeatNumber,
  cause: DrawCause,
  random: Random,
): GameState {
  const sector = random.pickSector();
  const tier = pickTier(tierChancesByTurn(state.turn), random);
  const drawn = drawCard({ deck: state.deck, discard: state.discard }, { by: "sector", sector }, tier, random);
  const withCard = updateSeat(state, seat, (current) => ({
    ...current,
    hand: [...current.hand, ...drawn.cards],
    drawnThisPhase: [...current.drawnThisPhase, ...drawn.cards],
  }));
  const shuffles = drawn.shuffles.map(
    (shuffle): DrawLogEntry => ({ kind: "shuffle", turn: state.turn, seat, ...shuffle }),
  );
  const draws: ReadonlyArray<DrawLogEntry> =
    drawn.cards.length === 0
      ? []
      : [
          {
            kind: "draw",
            turn: state.turn,
            seat,
            cause,
            count: drawn.cards.length,
            asked: { by: "sector", sector, tier },
          },
        ];
  return {
    ...withCard,
    deck: drawn.piles.deck,
    discard: drawn.piles.discard,
    drawLog: [...withCard.drawLog, ...shuffles, ...draws],
  };
}
