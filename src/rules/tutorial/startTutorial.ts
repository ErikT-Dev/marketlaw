import { QUESTS } from "../../shared/catalogue/QUESTS";
import { MARKETPLACE_PLACE_ORDER } from "../MARKETPLACE_PLACE_ORDER";
import { seededRandom } from "../seededRandom";
import { setUpGame } from "../setUpGame";
import { withMainPhaseStart } from "../withMainPhaseStart";
import { TUTORIAL_DECK } from "./TUTORIAL_DECK";
import { TUTORIAL_SETUP } from "./TUTORIAL_SETUP";
import type { TutorialState } from "./TutorialState";

const TUTORIAL_SEED = 0;

export function startTutorial(startedAt: number): TutorialState {
  const dealt = setUpGame(
    { players: 1, kind: "casual", startedAt },
    seededRandom(TUTORIAL_SEED, TUTORIAL_SEED),
  );
  const game = withMainPhaseStart({
    ...dealt,
    seats: dealt.seats.map((seat) => ({ ...seat, hand: TUTORIAL_SETUP.hand })),
    deck: TUTORIAL_DECK,
    discard: [],
    marketplace: MARKETPLACE_PLACE_ORDER.map((place) => ({
      place,
      card: TUTORIAL_SETUP.marketplace[place],
      phasesShown: 0,
    })),
    quests: TUTORIAL_SETUP.quests.map((quest) => ({ quest, turnsOnTable: 1 })),
    questList: QUESTS.map(({ name }) => name).filter(
      (name) => !TUTORIAL_SETUP.quests.includes(name),
    ),
    bonusTypes: TUTORIAL_SETUP.bonusTypes,
  });
  return { stage: "T1.1", game };
}
