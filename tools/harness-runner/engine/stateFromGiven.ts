import * as v from "valibot";
import { firstPlayerOf } from "../../../src/rules/firstPlayerOf.ts";
import type { GameState } from "../../../src/rules/GameState.ts";
import { marketGoOf } from "../../../src/rules/marketGoOf.ts";
import { MARKETPLACE_PLACE_ORDER } from "../../../src/rules/MARKETPLACE_PLACE_ORDER.ts";
import { SEAT_NUMBERS } from "../../../src/rules/SEAT_NUMBERS.ts";
import { withMainPhaseStart } from "../../../src/rules/withMainPhaseStart.ts";
import { CARD_NAMES } from "../../../src/shared/catalogue/CARD_NAMES.ts";
import { QUESTS } from "../../../src/shared/catalogue/QUESTS.ts";
import { TYPE_NAMES } from "../../../src/shared/catalogue/TYPE_NAMES.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { Given } from "./Given.ts";
import { seatFromGiven } from "./seatFromGiven.ts";

const DEFAULT_PLAYERS = 2;

function phaseOf(given: Given): GameState["phase"] {
  return given.phase === "ended" || given.phase === "market" ? given.phase : "main";
}

function withCheckedMarketGo(state: GameState, given: Given): GameState {
  const marketGo = marketGoOf(state);
  if (given.market_go !== undefined && given.market_go.seat !== marketGo) {
    throw new Error(
      `given market_go seat ${String(given.market_go.seat)} is not the next seat in player order without its go (${String(marketGo)})`,
    );
  }
  return state;
}

export function stateFromGiven(given: Given): GameState {
  const players = given.players ?? DEFAULT_PLAYERS;
  const extraSeat = given.seats?.find((entry) => entry.seat > players);
  if (extraSeat !== undefined) {
    throw new Error(`given seat ${extraSeat.seat} is above the ${players} players`);
  }
  const seats = SEAT_NUMBERS.slice(0, players).map((seat) =>
    seatFromGiven(
      seat,
      given.seats?.find((entry) => entry.seat === seat),
    ),
  );
  const marketplace = MARKETPLACE_PLACE_ORDER.map((place) => {
    const entry = given.marketplace?.find((slot) => slot.place === place);
    return { place, card: entry?.card ?? null, phasesShown: entry?.phases_shown ?? 0 };
  });
  const quests = (given.quests ?? []).map(({ quest, turns_on_table: turnsOnTable }) =>
    quest === null ? null : { quest, turnsOnTable: turnsOnTable ?? 1 },
  );
  const discard = given.discard ?? [];
  const placed = [
    ...seats.flatMap((seat) => [...seat.hand, ...seat.city]),
    ...marketplace.flatMap(({ card }) => (card === null ? [] : [card])),
    ...discard,
  ];
  const turn = given.turn ?? 1;
  const started = withMainPhaseStart({
    turn,
    phase: phaseOf(given),
    firstPlayer: given.first_player ?? firstPlayerOf(turn, seats),
    seats,
    deck: given.deck ?? CARD_NAMES.filter((name) => !placed.includes(name)),
    discard,
    holdingPile: [],
    drawLog: [],
    marketplace,
    quests,
    questList:
      given.quest_list ??
      QUESTS.map(({ name }) => name).filter(
        (name) =>
          !quests.some((place) => place?.quest === name) &&
          !seats.some((seat) => seat.questsCompleted.includes(name)),
      ),
    bonusTypes: given.bonus_types ?? TYPE_NAMES.slice(0, 2),
    doneOrder: seats.filter((seat) => seat.isDone).map((seat) => seat.seat),
    firstCompletions: given.first_completions ?? [],
    clockStartedAt: v.parse(EpochMs, given.clock_ms ?? 0),
  });
  return withCheckedMarketGo(started, given);
}
