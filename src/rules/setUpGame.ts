import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import { dealStartingHand } from "./dealStartingHand";
import { fillMarketplace } from "./fillMarketplace";
import type { GameSetup } from "./GameSetup";
import type { GameState } from "./GameState";
import { MARKETPLACE_PLACE_ORDER } from "./MARKETPLACE_PLACE_ORDER";
import { newSeat } from "./newSeat";
import { pickBonusTypes } from "./pickBonusTypes";
import { highestIncomeInGameOf } from "./highestIncomeInGameOf";
import { pickStartingQuests } from "./pickStartingQuests";
import type { Piles } from "./Piles";
import type { Random } from "./Random";
import { SEAT_NUMBERS } from "./SEAT_NUMBERS";
import { withMainPhaseStart } from "./withMainPhaseStart";
import type { SeatsDealt } from "./SeatsDealt";

const FIRST_TURN = 1;
const FIRST_TURN_BUILD_PASSES = 2;

function dealSeats(setup: GameSetup, piles: Piles, random: Random): SeatsDealt {
  return SEAT_NUMBERS.slice(0, setup.players).reduce<SeatsDealt>(
    (soFar, seat) => {
      const deal = dealStartingHand(soFar.piles, random);
      const dealtSeat = { ...newSeat(seat), hand: deal.hand, mainPhaseStartedAt: setup.startedAt };
      return { seats: [...soFar.seats, dealtSeat], piles: deal.piles };
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
  const quests = pickStartingQuests(highestIncomeInGameOf(dealt.seats), random);
  return withMainPhaseStart({
    kind: setup.kind,
    turn: FIRST_TURN,
    phase: "main",
    firstPlayer: 1,
    seats: dealt.seats.map((seat) => ({ ...seat, buildPasses: FIRST_TURN_BUILD_PASSES })),
    deck: filled.piles.deck,
    discard: filled.piles.discard,
    holdingPile: [],
    drawLog: [],
    mainPhaseLog: [],
    marketplace: filled.marketplace,
    quests: quests.map((quest) => ({ quest, turnsOnTable: 1, isInExtraTurn: false })),
    questList: QUEST_LINES.map(({ name }) => name).filter((name) => !quests.includes(name)),
    bonusTypes: pickBonusTypes(random),
    doneOrder: [],
    leaveOrder: [],
    clockStartedAt: setup.startedAt,
    pause: null,
    vote: null,
    lastVoteTurn: null,
    grace: [],
    result: null,
  });
}
