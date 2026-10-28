import type { DrawAsked } from "../shared/DrawAsked";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import { drawCard } from "./drawCard";
import type { DrawForSeat } from "./DrawForSeat";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

function askedOf({ target, tier }: DrawForSeat): DrawAsked {
  return target.by === "sector"
    ? { by: "sector", sector: target.sector, tier }
    : { by: "kind", kind: target.kind, tier };
}

export function drawIntoHand(state: GameState, draw: DrawForSeat, random: Random): GameState {
  const { seat, cause, target, tier } = draw;
  const piles = { deck: state.deck, discard: state.discard };
  const drawn = drawCard(piles, target, tier, random, "top_card");
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
            asked: askedOf(draw),
          },
        ];
  return {
    ...withCard,
    deck: drawn.piles.deck,
    discard: drawn.piles.discard,
    drawLog: [...withCard.drawLog, ...shuffles, ...draws],
  };
}
