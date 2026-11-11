import * as v from "valibot";
import { pauseGame } from "../../../src/rules/pauseGame.ts";
import { decisionClockOf } from "../../../src/rules/decisionClockOf.ts";
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

function withGivenPause(state: GameState, isPaused: boolean): GameState {
  const seatsByDeadline = state.seats
    .map(({ seat }) => ({ seat, deadline: decisionClockOf(state, seat)?.deadline ?? null }))
    .filter((entry) => entry.deadline !== null)
    .sort((first, second) => (first.deadline ?? 0) - (second.deadline ?? 0));
  const first = seatsByDeadline[0];
  if (!isPaused || first === undefined || first.deadline === null) {
    return state;
  }
  return pauseGame(state, first.deadline);
}

export function stateFromGiven(given: Given): GameState {
  const players = given.players ?? DEFAULT_PLAYERS;
  const extraSeat = given.seats?.find((entry) => entry.seat > players);
  if (extraSeat !== undefined) {
    throw new Error(`given seat ${extraSeat.seat} is above the ${players} players`);
  }
  const turn = given.turn ?? 1;
  const seats = SEAT_NUMBERS.slice(0, players).map((seat) =>
    seatFromGiven(
      seat,
      given.seats?.find((entry) => entry.seat === seat),
      turn,
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
    leaveOrder: seats.filter((seat) => seat.departure !== null).map((seat) => seat.seat),
    firstCompletions: given.first_completions ?? [],
    clockStartedAt: v.parse(EpochMs, given.clock_ms ?? 0),
    pause: null,
    vote: null,
    lastVoteTurn: given.last_vote_turn ?? null,
    grace: [],
    result: null,
  });
  return withGivenPause(withCheckedMarketGo(started, given), given.paused === true);
}
