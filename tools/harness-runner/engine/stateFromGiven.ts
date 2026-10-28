import type { GameState } from "../../../src/rules/GameState.ts";
import { MARKETPLACE_PLACE_ORDER } from "../../../src/rules/MARKETPLACE_PLACE_ORDER.ts";
import { SEAT_NUMBERS } from "../../../src/rules/SEAT_NUMBERS.ts";
import { withMainPhaseStart } from "../../../src/rules/withMainPhaseStart.ts";
import { CARD_NAMES } from "../../../src/shared/catalogue/CARD_NAMES.ts";
import { QUESTS } from "../../../src/shared/catalogue/QUESTS.ts";
import { TYPE_NAMES } from "../../../src/shared/catalogue/TYPE_NAMES.ts";
import type { Given } from "./Given.ts";
import { seatFromGiven } from "./seatFromGiven.ts";

const DEFAULT_PLAYERS = 2;

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
  const quests = (given.quests ?? []).map((entry) => ({
    quest: entry.quest,
    turnsOnTable: entry.turns_on_table ?? 1,
  }));
  const discard = given.discard ?? [];
  const placed = [
    ...seats.flatMap((seat) => [...seat.hand, ...seat.city]),
    ...marketplace.flatMap(({ card }) => (card === null ? [] : [card])),
    ...discard,
  ];
  return withMainPhaseStart({
    turn: given.turn ?? 1,
    phase: given.phase === "ended" ? "ended" : "main",
    seats,
    deck: given.deck ?? CARD_NAMES.filter((name) => !placed.includes(name)),
    discard,
    holdingPile: [],
    drawLog: [],
    marketplace,
    quests,
    questList:
      given.quest_list ??
      QUESTS.map(({ name }) => name).filter((name) => !quests.some(({ quest }) => quest === name)),
    bonusTypes: given.bonus_types ?? TYPE_NAMES.slice(0, 2),
    doneOrder: seats.filter((seat) => seat.isDone).map((seat) => seat.seat),
  });
}
