import type { GameState } from "../../src/rules/GameState.ts";
import type { SeatState } from "../../src/rules/SeatState.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import type { CardName } from "../../src/shared/catalogue/CardName.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";
import type { SentToSeat } from "./SentToSeat.ts";
import { shownPilesViolations } from "./shownPilesViolations.ts";
import { typeCountViolations } from "./typeCountViolations.ts";

function knownInHandOf(state: GameState, seat: SeatState): ReadonlyArray<CardName> {
  const start = state.mainPhaseStart.seats.find((candidate) => candidate.seat === seat.seat);
  return state.phase === "main" ? (start?.knownInHand ?? []) : seat.knownInHand;
}

function hiddenFrom(state: GameState, viewer: SeatNumber): ReadonlyArray<CardName> {
  const others = state.seats.filter((seat) => seat.seat !== viewer);
  const known = others.flatMap((seat) => knownInHandOf(state, seat));
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
  return hidden.filter((card) => !known.includes(card));
}

function quotedAmong(sent: string, wanted: ReadonlySet<string>): ReadonlySet<string> {
  return new Set(sent.split('"').filter((piece) => wanted.has(piece)));
}

function leakViolations(state: GameState, viewer: SeatNumber, sent: string): ReadonlyArray<string> {
  const hidden = hiddenFrom(state, viewer);
  const quoted = quotedAmong(sent, new Set<string>([...hidden, "seed"]));
  const leaked = hidden.filter((card) => quoted.has(card));
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
    ...shownPilesViolations(state, viewer, view),
    ...(hasOthersNewDraws
      ? [`I24: seat ${String(viewer)} sees another player's draw before the phase ends`]
      : []),
  ];
}

function versionViolations(
  before: RoomRecord,
  after: RoomRecord,
  sender: { readonly seats: ReadonlyArray<SeatNumber>; readonly isAccepted: boolean },
): ReadonlyArray<string> {
  const beforeState = before.game?.saved.state;
  const afterState = after.game?.saved.state;
  const isSeenByEveryone =
    beforeState?.turn !== afterState?.turn ||
    beforeState?.phase !== afterState?.phase ||
    beforeState?.phase === "market";
  return (after.game?.seats ?? []).flatMap((seat) => {
    const versionBefore = before.game?.seats.find(
      (candidate) => candidate.seat === seat.seat,
    )?.stateVersion;
    const isOwnAcceptedAction = sender.seats.includes(seat.seat) && sender.isAccepted;
    return versionBefore === seat.stateVersion || isOwnAcceptedAction || isSeenByEveryone
      ? []
      : [
          `I25: seat ${String(seat.seat)}'s state version moved with another player's hidden action`,
        ];
  });
}

export function whatSeatsSeeViolations(
  before: RoomRecord,
  after: RoomRecord,
  sender: { readonly seats: ReadonlyArray<SeatNumber>; readonly isAccepted: boolean },
  sentTo: ReadonlyMap<SeatNumber, SentToSeat>,
): ReadonlyArray<string> {
  const state = after.game?.saved.state;
  if (state === undefined) {
    return [];
  }
  const seen = [...sentTo.entries()].flatMap(([viewer, sent]) => [
    ...leakViolations(state, viewer, sent.text),
    ...startViewViolations(state, viewer, sent.view),
    ...(sent.view === undefined ? [] : typeCountViolations(state, viewer, sent.view)),
    ...(sent.isFrameSent && sent.isUnchanged
      ? [`I24: seat ${String(viewer)} was sent an update although nothing it may see changed`]
      : []),
  ]);
  return [...seen, ...versionViolations(before, after, sender)];
}
