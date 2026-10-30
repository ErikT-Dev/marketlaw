import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import type { Sector } from "../shared/catalogue/Sector";
import type { Tier } from "../shared/catalogue/Tier";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import type { SeatNumber } from "../shared/SeatNumber";
import type { TurnDrawChoice } from "../shared/TurnDrawChoice";
import { cardsIntoHand } from "./cardsIntoHand";
import { endMarketPhase } from "./endMarketPhase";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { marketGoOf } from "./marketGoOf";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";
import { updateSeat } from "./updateSeat";

type TurnDraw = Extract<GameAction, { readonly type: "turn_draw" }>;
type TierDraw = { readonly tier: Tier; readonly count: number };
type DeckDraws = { readonly state: GameState; readonly draws: ReadonlyArray<TierDraw> };

const DECK_DRAWS = { A: 1, B: 2 } as const;

function withMarketCard(state: GameState, seat: SeatNumber, card: CardName): GameState {
  const taken = {
    ...state,
    marketplace: state.marketplace.map((slot) =>
      slot.card === card ? { ...slot, card: null, phasesShown: 0 } : slot,
    ),
  };
  return updateSeat(taken, seat, (current) => ({
    ...current,
    hand: [...current.hand, card],
    newCards: [...current.newCards, card],
    knownInHand: [...current.knownInHand, card],
  }));
}

function sectorOf(choice: TurnDrawChoice): Sector {
  return choice.option === "A" ? cardOf(choice.card).sector : choice.sector;
}

function withTierDraw(
  draws: ReadonlyArray<TierDraw>,
  tier: Tier,
  count: number,
): ReadonlyArray<TierDraw> {
  const last = draws.at(-1);
  return last?.tier === tier
    ? [...draws.slice(0, -1), { tier, count: last.count + count }]
    : [...draws, { tier, count }];
}

function drawFromDeck(
  state: GameState,
  seat: SeatNumber,
  choice: TurnDrawChoice,
  random: Random,
): GameState {
  const sector = sectorOf(choice);
  const drawn = Array.from({ length: DECK_DRAWS[choice.option] }).reduce<DeckDraws>(
    (soFar) => {
      const tier = pickTier(tierChancesByTurn(state.turn), random);
      const next = cardsIntoHand(soFar.state, { seat, target: { by: "sector", sector }, tier }, random);
      return { state: next.state, draws: withTierDraw(soFar.draws, tier, next.cards.length) };
    },
    { state, draws: [] },
  );
  const entries = drawn.draws.map(
    ({ tier, count }): DrawLogEntry => ({
      kind: "turn_draw",
      turn: state.turn,
      seat,
      choice,
      count,
      asked: { by: "sector", sector, tier },
    }),
  );
  return { ...drawn.state, drawLog: [...drawn.state.drawLog, ...entries] };
}

export function takeTurnDraw(
  state: GameState,
  action: TurnDraw,
  random: Random,
  at: number,
): GameState {
  const { seat, choice } = action;
  const clock = decisionClockOf(state, seat);
  const taken = choice.option === "A" ? withMarketCard(state, seat, choice.card) : state;
  const drawn = {
    ...updateSeat(drawFromDeck(taken, seat, choice, random), seat, (current) => ({
      ...current,
      hasHadMarketGo: true,
      timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
    })),
    clockStartedAt: at,
  };
  return marketGoOf(drawn) === null ? endMarketPhase(drawn, at) : drawn;
}
