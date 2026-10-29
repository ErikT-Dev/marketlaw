import type { DrawAsked } from "../shared/DrawAsked";
import { cardsIntoHand } from "./cardsIntoHand";
import type { DrawForSeat } from "./DrawForSeat";
import type { GameState } from "./GameState";
import type { Random } from "./Random";

function askedOf({ target, tier }: DrawForSeat): DrawAsked {
  return target.by === "sector"
    ? { by: "sector", sector: target.sector, tier }
    : { by: "kind", kind: target.kind, tier };
}

export function drawIntoHand(state: GameState, draw: DrawForSeat, random: Random): GameState {
  const drawn = cardsIntoHand(state, draw, random);
  if (drawn.cards.length === 0) {
    return drawn.state;
  }
  return {
    ...drawn.state,
    drawLog: [
      ...drawn.state.drawLog,
      {
        kind: "draw",
        turn: state.turn,
        seat: draw.seat,
        cause: draw.cause,
        count: drawn.cards.length,
        asked: askedOf(draw),
      },
    ],
  };
}
