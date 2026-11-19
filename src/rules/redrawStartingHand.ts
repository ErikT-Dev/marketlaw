import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";
import { dealStartingHand } from "./dealStartingHand";
import type { GameState } from "./GameState";
import { kindTierCountsOf } from "./kindTierCountsOf";
import type { Random } from "./Random";
import type { SeatPilesAtStart } from "./SeatPilesAtStart";
import { seatOf } from "./seatOf";
import { updateSeat } from "./updateSeat";

function withRedrawSeenBySeat(
  piles: SeatPilesAtStart,
  handPutBack: ReadonlyArray<CardName>,
  handDealt: ReadonlyArray<CardName>,
): SeatPilesAtStart {
  const withHandPutBack = kindTierCountsOf(handPutBack, piles.kindTierCounts);
  return { ...piles, kindTierCounts: kindTierCountsOf(handDealt, withHandPutBack, -1) };
}

export function redrawStartingHand(
  state: GameState,
  seatNumber: SeatNumber,
  random: Random,
): GameState {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined) {
    return state;
  }
  const deck = random.shuffle([...state.deck, ...seat.hand]);
  const deal = dealStartingHand({ deck, discard: state.discard }, random);
  const redrawn = updateSeat(state, seatNumber, (current) => ({
    ...current,
    hand: deal.hand,
    redrawsUsed: current.redrawsUsed + 1,
  }));
  return {
    ...redrawn,
    deck: deal.piles.deck,
    discard: deal.piles.discard,
    mainPhaseStart: {
      ...redrawn.mainPhaseStart,
      piles: redrawn.mainPhaseStart.piles.map((piles) =>
        piles.seat === seatNumber ? withRedrawSeenBySeat(piles, seat.hand, deal.hand) : piles,
      ),
    },
  };
}
