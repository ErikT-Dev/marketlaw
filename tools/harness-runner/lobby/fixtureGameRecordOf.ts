import type { StoredGameRecord } from "../../../src/server/records/StoredGameRecord.ts";
import type { SeatRecord } from "../../../src/shared/records/SeatRecord.ts";
import type { FixturePlayer } from "./FixturePlayer.ts";
import type { SeatNumber } from "../../../src/shared/SeatNumber.ts";

const SEAT_NUMBERS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function seatNumberAt(index: number): SeatNumber {
  const seat = SEAT_NUMBERS[index];
  if (seat === undefined) {
    throw new Error(`a game record fixture has at most 4 players, not ${String(index + 1)}`);
  }
  return seat;
}

function seatRecordOf(player: FixturePlayer, seat: SeatNumber): SeatRecord {
  return {
    seat,
    result: player.result,
    place: player.place,
    leftInTurn: null,
    score: player.score,
    hasReachedEndGoal: false,
    income: 0,
    fundsAndHand: 0,
    workforce: 0,
    quality: 0,
    satisfaction: 0,
    product: 0,
    distribution: 0,
    influence: 0,
    bonusTypePoints: 0,
    projects: [],
    questsCompleted: 0,
    comboGains: { workforce: 0, quality: 0, satisfaction: 0 },
    typeCounts: {},
  };
}

export function fixtureGameRecordOf(
  endedMs: number,
  turns: number,
  players: ReadonlyArray<FixturePlayer>,
): StoredGameRecord {
  const seats = players.map((player, index) => seatRecordOf(player, seatNumberAt(index)));
  const winner =
    seats.find(({ result }) => result === "won") ?? seats.find(({ place }) => place === 1);
  return {
    turns,
    winner: winner?.seat ?? 1,
    bonusTypes: [],
    seats,
    kind: "casual",
    startedMs: endedMs,
    endedMs,
    players: players.map(({ playerId }, index) => ({ seat: seatNumberAt(index), playerId })),
  };
}
