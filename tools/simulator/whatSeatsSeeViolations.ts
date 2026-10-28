import type { GameState } from "../../src/rules/GameState.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import type { CardName } from "../../src/shared/catalogue/CardName.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";
import type { SentToSeat } from "./SentToSeat.ts";

function hiddenFrom(state: GameState, viewer: SeatNumber): ReadonlyArray<CardName> {
  const others = state.seats.filter((seat) => seat.seat !== viewer);
  const playedThisPhase = others.flatMap((seat) => {
    const start = state.mainPhaseStart.seats.find((candidate) => candidate.seat === seat.seat);
    return seat.city.filter((card) => !(start?.city ?? []).includes(card));
  });
  const hidden = [
    ...others.flatMap((seat) => seat.hand),
    ...state.deck,
    ...state.holdingPile,
    ...(state.phase === "main" ? playedThisPhase : []),
  ];
  return state.phase === "main"
    ? hidden.filter((card) => !state.mainPhaseStart.discard.includes(card))
    : hidden;
}

function quotedIn(sent: string): ReadonlySet<string> {
  return new Set([...sent.matchAll(/"([^"\\]*)"/g)].map((match) => match[1] ?? ""));
}

function leakViolations(state: GameState, viewer: SeatNumber, sent: string): ReadonlyArray<string> {
  const quoted = quotedIn(sent);
  const leaked = hiddenFrom(state, viewer).filter((card) => quoted.has(card));
  return [
    ...leaked.map(
      (card) => `I23: seat ${String(viewer)} was sent ${card}, which is hidden from it`,
    ),
    ...(quoted.has("seed") ? [`I23: seat ${String(viewer)} was sent the random seed`] : []),
  ];
}

function startViewViolations(
  state: GameState,
  viewer: SeatNumber,
  view: PlayerView | undefined,
): ReadonlyArray<string> {
  if (state.phase !== "main" || view === undefined) {
    return [];
  }
  const changedSeats = view.seats.flatMap((seen) => {
    const start = state.mainPhaseStart.seats.find((seat) => seat.seat === seen.seat);
    if (seen.kind === "own" || start === undefined) {
      return [];
    }
    const isAsAtStart =
      JSON.stringify([seen.stats, seen.city, seen.handCount, seen.buildPasses]) ===
      JSON.stringify([start.stats, start.city, start.hand.length, start.buildPasses]);
    return isAsAtStart
      ? []
      : [
          `I24: seat ${String(viewer)} sees seat ${String(seen.seat)} changed during the main phase`,
        ];
  });
  const hasOthersNewDraws = view.drawLog
    .slice(state.mainPhaseStart.drawLogLength)
    .some((entry) => entry.seat !== viewer);
  return [
    ...changedSeats,
    ...(hasOthersNewDraws
      ? [`I24: seat ${String(viewer)} sees another player's draw before the phase ends`]
      : []),
  ];
}

function versionViolations(
  before: RoomRecord,
  after: RoomRecord,
  sender: { readonly seat: SeatNumber; readonly isAccepted: boolean },
): ReadonlyArray<string> {
  const beforeState = before.game?.saved.state;
  const afterState = after.game?.saved.state;
  const isPhaseChange =
    beforeState?.turn !== afterState?.turn || beforeState?.phase !== afterState?.phase;
  return (after.game?.seats ?? []).flatMap((seat) => {
    const versionBefore = before.game?.seats.find(
      (candidate) => candidate.seat === seat.seat,
    )?.stateVersion;
    const isOwnAcceptedAction = seat.seat === sender.seat && sender.isAccepted;
    return versionBefore === seat.stateVersion || isOwnAcceptedAction || isPhaseChange
      ? []
      : [
          `I25: seat ${String(seat.seat)}'s state version moved with another player's hidden action`,
        ];
  });
}

export function whatSeatsSeeViolations(
  before: RoomRecord,
  after: RoomRecord,
  sender: { readonly seat: SeatNumber; readonly isAccepted: boolean },
  sentTo: ReadonlyMap<SeatNumber, SentToSeat>,
): ReadonlyArray<string> {
  const state = after.game?.saved.state;
  if (state === undefined) {
    return [];
  }
  const seen = [...sentTo.entries()].flatMap(([viewer, sent]) => [
    ...leakViolations(state, viewer, sent.text),
    ...startViewViolations(state, viewer, sent.view),
  ]);
  return [...seen, ...versionViolations(before, after, sender)];
}
