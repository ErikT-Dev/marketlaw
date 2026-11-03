import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import { QUESTS } from "../shared/catalogue/QUESTS";
import { dealStartingHand } from "./dealStartingHand";
import { fillMarketplace } from "./fillMarketplace";
import type { GameSetup } from "./GameSetup";
import type { GameState } from "./GameState";
import { MARKETPLACE_PLACE_ORDER } from "./MARKETPLACE_PLACE_ORDER";
import { newSeat } from "./newSeat";
import { pickBonusTypes } from "./pickBonusTypes";
import { pickStartingQuests } from "./pickStartingQuests";
import type { Piles } from "./Piles";
import type { Random } from "./Random";
import { SEAT_NUMBERS } from "./SEAT_NUMBERS";
import { withMainPhaseStart } from "./withMainPhaseStart";
import type { SeatsDealt } from "./SeatsDealt";

const FIRST_TURN = 1;

function dealSeats(setup: GameSetup, piles: Piles, random: Random): SeatsDealt {
  return SEAT_NUMBERS.slice(0, setup.players).reduce<SeatsDealt>(
    (soFar, seat) => {
      const deal = dealStartingHand(soFar.piles, random);
      return { seats: [...soFar.seats, { ...newSeat(seat), hand: deal.hand }], piles: deal.piles };
    },
    { seats: [], piles },
  );
}

export function setUpGame(setup: GameSetup, random: Random): GameState {
  const dealt = dealSeats(setup, { deck: random.shuffle(CARD_NAMES), discard: [] }, random);
  const emptyMarketplace = MARKETPLACE_PLACE_ORDER.map((place) => ({
    place,
    card: null,
    phasesShown: 0,
  }));
  const filled = fillMarketplace(emptyMarketplace, dealt.piles, FIRST_TURN, random);
  const quests = pickStartingQuests(random);
  return withMainPhaseStart({
    turn: FIRST_TURN,
    phase: "main",
    firstPlayer: 1,
    seats: dealt.seats,
    deck: filled.piles.deck,
    discard: filled.piles.discard,
    holdingPile: [],
    drawLog: [],
    marketplace: filled.marketplace,
    quests: quests.map((quest) => ({ quest, turnsOnTable: 1 })),
    questList: QUESTS.map(({ name }) => name).filter((name) => !quests.includes(name)),
    bonusTypes: pickBonusTypes(random),
    doneOrder: [],
    firstCompletions: [],
    clockStartedAt: setup.startedAt,
    pause: null,
    grace: [],
    result: null,
  });
}
