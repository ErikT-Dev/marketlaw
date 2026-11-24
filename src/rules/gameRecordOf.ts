import type { PlaceResult } from "../shared/PlaceResult";
import { isAbandoned } from "../shared/isAbandoned";
import type { GameRecord } from "../shared/records/GameRecord";
import type { SeatRecord } from "../shared/records/SeatRecord";
import { comboGainsOf } from "./comboGainsOf";
import type { SavedGame } from "./SavedGame";
import type { SeatState } from "./SeatState";
import { typeCountsOf } from "./typeCountsOf";

function seatRecordOf(place: PlaceResult, index: number, seat: SeatState): SeatRecord {
  const { stats } = seat;
  return {
    seat: place.seat,
    result: place.leftInTurn !== null ? "left" : index === 0 ? "won" : "lost",
    place: index + 1,
    leftInTurn: place.leftInTurn,
    score: place.score,
    hasReachedEndGoal: place.hasReachedEndGoal,
    income: place.income,
    fundsAndHand: place.funds + place.cardsInHand,
    workforce: stats.workforce,
    quality: stats.quality,
    satisfaction: stats.satisfaction,
    product: stats.product,
    distribution: stats.distribution,
    influence: stats.influence,
    bonusTypePoints: place.bonusTypePoints,
    projects: seat.projects,
    questsCompleted: seat.questsCompleted.length,
    comboGains: comboGainsOf(seat),
    typeCounts: typeCountsOf(seat),
    counts: place.counts,
  };
}

export function gameRecordOf(saved: SavedGame): GameRecord | null {
  const { state } = saved;
  const winner = state.result?.places[0];
  if (state.result === null || isAbandoned(state.result.endedBy) || winner === undefined) {
    return null;
  }
  return {
    turns: state.turn,
    winner: winner.seat,
    bonusTypes: state.bonusTypes,
    seats: state.result.places.flatMap((place, index) => {
      const seat = state.seats.find((candidate) => candidate.seat === place.seat);
      return seat === undefined ? [] : [seatRecordOf(place, index, seat)];
    }),
  };
}
