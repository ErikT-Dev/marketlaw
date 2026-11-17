import { ratingChangesOf } from "../../src/server/ratings/ratingChangesOf.ts";
import type { RatedSeat } from "../../src/server/ratings/RatedSeat.ts";
import { roundedTotalChange } from "../../src/server/ratings/roundedTotalChange.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";

type RatedPlayer = {
  readonly rating: number;
  readonly rankedGames: number;
  readonly highestRating: number;
};

type GameCase = {
  readonly name: string;
  readonly playersByPlace: ReadonlyArray<RatedPlayer>;
  readonly changes: ReadonlyArray<number>;
};

type TotalCase = {
  readonly name: string;
  readonly changesPerOpponent: ReadonlyArray<number>;
  readonly total: number;
};

const SEATS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function newPlayer(rating: number, rankedGames = 0, highestRating = 1000): RatedPlayer {
  return { rating, rankedGames, highestRating };
}

const NEW = newPlayer(1000);

const GAME_CASES: ReadonlyArray<GameCase> = [
  { name: "A10.11, three new players", playersByPlace: [NEW, NEW, NEW], changes: [20, 0, -20] },
  { name: "A10.12, two new players", playersByPlace: [NEW, NEW], changes: [20, -20] },
  {
    name: "A10.12, four new players",
    playersByPlace: [NEW, NEW, NEW, NEW],
    changes: [20, 7, -7, -20],
  },
  {
    name: "own k and the ratings before the game",
    playersByPlace: [newPlayer(1000, 10), newPlayer(1200, 10), newPlayer(900, 35)],
    changes: [22, -12, -5],
  },
  {
    name: "a difference over 400 counts as 400",
    playersByPlace: [newPlayer(1000, 10), newPlayer(1500, 10), newPlayer(1400, 10)],
    changes: [36, -11, -25],
  },
  {
    name: "k 5 after reaching 2400",
    playersByPlace: [newPlayer(2000, 50, 2410), newPlayer(2000, 50), newPlayer(2000, 50)],
    changes: [5, 0, -10],
  },
];

const TOTAL_CASES: ReadonlyArray<TotalCase> = [
  { name: "+2.5", changesPerOpponent: [1.25, 1.25], total: 3 },
  { name: "-2.5", changesPerOpponent: [-1.25, -1.25], total: -3 },
  { name: "+2.4999996", changesPerOpponent: [2.4999996], total: 3 },
  { name: "+2.5000004", changesPerOpponent: [2.5000004], total: 3 },
  { name: "-2.4999996", changesPerOpponent: [-2.4999996], total: -3 },
  { name: "+2.4999994", changesPerOpponent: [2.4999994], total: 2 },
];

function seatsOf(playersByPlace: ReadonlyArray<RatedPlayer>): ReadonlyArray<RatedSeat> {
  return playersByPlace.map((player, index) => ({
    ...player,
    seat: SEATS[index] ?? 1,
    place: index + 1,
  }));
}

function gameProblems({ name, playersByPlace, changes }: GameCase): ReadonlyArray<string> {
  const computed = ratingChangesOf(seatsOf(playersByPlace)).map(({ change }) => change);
  return computed.join(" ") === changes.join(" ")
    ? []
    : [`${name}: changes ${computed.join(", ")}, expected ${changes.join(", ")}`];
}

function totalProblems({ name, changesPerOpponent, total }: TotalCase): ReadonlyArray<string> {
  const computed = roundedTotalChange(changesPerOpponent);
  return computed === total
    ? []
    : [`a total of ${name} became ${String(computed)}, expected ${String(total)}`];
}

export function checkRatings(): ReadonlyArray<string> {
  return [...GAME_CASES.flatMap(gameProblems), ...TOTAL_CASES.flatMap(totalProblems)];
}
