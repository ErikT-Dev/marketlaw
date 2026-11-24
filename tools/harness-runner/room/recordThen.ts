import { gameRecordOf } from "../../../src/rules/gameRecordOf.ts";
import type { SeatRecord } from "../../../src/shared/records/SeatRecord.ts";
import type { RoomGame } from "../../../src/server/room/RoomGame.ts";

function nameOf(seatNames: ReadonlyArray<string>, seat: number): string {
  return seatNames[seat - 1] ?? `Seat ${String(seat)}`;
}

function playerThen(seat: SeatRecord, seatNames: ReadonlyArray<string>): unknown {
  return {
    username: nameOf(seatNames, seat.seat),
    result: seat.result,
    place: seat.place,
    left_in_turn: seat.leftInTurn,
    score: seat.score,
    reached_end_goal: seat.hasReachedEndGoal,
    income: seat.income,
    funds_plus_hand: seat.fundsAndHand,
    workforce: seat.workforce,
    quality: seat.quality,
    satisfaction: seat.satisfaction,
    product: seat.product,
    distribution: seat.distribution,
    influence: seat.influence,
    bonus_type_points: seat.bonusTypePoints,
    projects: seat.projects,
    quests_completed: seat.questsCompleted,
    combo_gains: seat.comboGains,
    type_counts: seat.typeCounts,
    q: seat.counts?.questsCompleted,
    t: seat.counts?.types,
    c: seat.counts?.combosClaimed,
    f: seat.counts?.worthGained,
  };
}

export function recordThen(game: RoomGame, seatNames: ReadonlyArray<string>): unknown {
  const record = gameRecordOf(game.saved);
  return record === null
    ? "none"
    : {
        turns: record.turns,
        winner: nameOf(seatNames, record.winner),
        bonus_types: record.bonusTypes,
        ranked: game.kind === "ranked",
        players: record.seats.map((seat) => playerThen(seat, seatNames)),
        results: Object.fromEntries(record.seats.map(({ seat, result }) => [seat, result])),
      };
}
