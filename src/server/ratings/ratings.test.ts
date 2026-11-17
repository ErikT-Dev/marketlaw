import { describe, expect, it } from "vitest";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { RatedSeat } from "./RatedSeat";
import { ratingChangesOf } from "./ratingChangesOf";
import { roundedTotalChange } from "./roundedTotalChange";

const SEATS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function seatsOf(
  players: ReadonlyArray<{ rating: number; rankedGames?: number; highestRating?: number }>,
): ReadonlyArray<RatedSeat> {
  return players.map(({ rating, rankedGames = 0, highestRating = 1000 }, index) => ({
    seat: SEATS[index] ?? 1,
    place: index + 1,
    rating,
    rankedGames,
    highestRating,
  }));
}

function changesOf(seats: ReadonlyArray<RatedSeat>): ReadonlyArray<number> {
  return ratingChangesOf(seats).map(({ change }) => change);
}

describe("rating changes", () => {
  it("gives three new players plus 20, 0 and minus 20", () => {
    expect(changesOf(seatsOf([{ rating: 1000 }, { rating: 1000 }, { rating: 1000 }]))).toEqual([
      20, 0, -20,
    ]);
  });

  it("gives two new players plus 20 and minus 20", () => {
    expect(changesOf(seatsOf([{ rating: 1000 }, { rating: 1000 }]))).toEqual([20, -20]);
  });

  it("gives four new players plus 20, 7, minus 7 and minus 20", () => {
    const four = seatsOf([{ rating: 1000 }, { rating: 1000 }, { rating: 1000 }, { rating: 1000 }]);
    expect(changesOf(four)).toEqual([20, 7, -7, -20]);
  });

  it("uses each player's own k and the ratings before the game", () => {
    const seats = seatsOf([
      { rating: 1000, rankedGames: 10 },
      { rating: 1200, rankedGames: 10 },
      { rating: 900, rankedGames: 35 },
    ]);
    expect(changesOf(seats)).toEqual([22, -12, -5]);
  });

  it("counts a rating difference over 400 as 400", () => {
    const seats = seatsOf([
      { rating: 1000, rankedGames: 10 },
      { rating: 1500, rankedGames: 10 },
      { rating: 1400, rankedGames: 10 },
    ]);
    expect(changesOf(seats)[0]).toBe(36);
  });

  it("uses k 5 for a player who ever reached 2400", () => {
    const seats = seatsOf([
      { rating: 2000, rankedGames: 50, highestRating: 2410 },
      { rating: 2000, rankedGames: 50 },
      { rating: 2000, rankedGames: 50 },
    ]);
    expect(changesOf(seats)).toEqual([5, 0, -10]);
  });

  it("ranks by place, not by seat order", () => {
    const seats: ReadonlyArray<RatedSeat> = [
      { seat: 1, place: 3, rating: 1000, rankedGames: 0, highestRating: 1000 },
      { seat: 2, place: 1, rating: 1000, rankedGames: 0, highestRating: 1000 },
      { seat: 3, place: 2, rating: 1000, rankedGames: 0, highestRating: 1000 },
    ];
    expect(ratingChangesOf(seats)).toEqual([
      { seat: 1, change: -20 },
      { seat: 2, change: 20 },
      { seat: 3, change: 0 },
    ]);
  });
});

describe("the total change", () => {
  it("rounds a total of exactly 2.5 away from zero", () => {
    expect(roundedTotalChange([1.25, 1.25])).toBe(3);
    expect(roundedTotalChange([-1.25, -1.25])).toBe(-3);
  });

  it("rounds to 6 decimal places before the whole number", () => {
    expect(roundedTotalChange([2.4999996])).toBe(3);
    expect(roundedTotalChange([-2.4999996])).toBe(-3);
    expect(roundedTotalChange([2.4999994])).toBe(2);
  });

  it("never gives minus zero", () => {
    expect(Object.is(roundedTotalChange([-0.4]), 0)).toBe(true);
  });
});
