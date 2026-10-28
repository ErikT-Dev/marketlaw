import type { Sector } from "../shared/catalogue/Sector";
import type { Tier } from "../shared/catalogue/Tier";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import type { Stats } from "../shared/Stats";
import { drawCard } from "./drawCard";
import type { Drawn } from "./Drawn";
import type { GameState } from "./GameState";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { tierChancesByTurn } from "./tierChancesByTurn";
import { updateSeat } from "./updateSeat";

function canTakeIncome(stats: Stats): boolean {
  const hasNoNegativeStat = stats.workforce >= 0 && stats.quality >= 0 && stats.satisfaction >= 0;
  return hasNoNegativeStat && stats.product >= 1 && stats.distribution >= 1;
}

function logEntriesOf(
  state: GameState,
  seat: SeatNumber,
  drawn: Drawn,
  asked: { readonly sector: Sector; readonly tier: Tier },
): ReadonlyArray<DrawLogEntry> {
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
            cause: "income",
            count: drawn.cards.length,
            asked: { by: "sector", ...asked },
          },
        ];
  return [...shuffles, ...draws];
}

export function takeIncome(state: GameState, seatNumber: SeatNumber, random: Random): GameState {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || !canTakeIncome(seat.stats)) {
    return state;
  }
  const sector = random.pickSector();
  const tier = pickTier(tierChancesByTurn(state.turn), random);
  const piles = { deck: state.deck, discard: state.discard };
  const drawn = drawCard(piles, { by: "sector", sector }, tier, random);
  const paid = updateSeat(state, seatNumber, (current) => ({
    ...current,
    stats: {
      ...current.stats,
      product: current.stats.product - 1,
      distribution: current.stats.distribution - 1,
      income: current.stats.income + 1,
    },
    hand: [...current.hand, ...drawn.cards],
    drawnThisPhase: [...current.drawnThisPhase, ...drawn.cards],
  }));
  const next = {
    ...paid,
    deck: drawn.piles.deck,
    discard: drawn.piles.discard,
    drawLog: [...paid.drawLog, ...logEntriesOf(state, seatNumber, drawn, { sector, tier })],
  };
  return takeIncome(next, seatNumber, random);
}
