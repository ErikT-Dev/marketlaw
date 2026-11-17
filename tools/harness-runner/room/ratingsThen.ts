import { isRecord } from "../../harness-check/isRecord.ts";
import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import type { RoomSession } from "./RoomSession.ts";

function givenRowOf(session: RoomSession, name: string): unknown {
  const playerId = session.identityNamed(name).playerId;
  const given = session.givenRatings.find((rating) => rating.playerId === playerId);
  return given === undefined
    ? null
    : { rating: given.rating, rankedGames: given.rankedGames, highestRating: given.highestRating };
}

function ratingsOf(session: RoomSession, names: ReadonlyArray<string>): unknown {
  return Object.fromEntries(
    names.map((name) => [
      name,
      session.records.ratingOf(session.identityNamed(name).playerId)?.rating ??
        NEW_PLAYER_RATING.rating,
    ]),
  );
}

export function ratingsThen(session: RoomSession, expected: unknown): unknown {
  if (expected !== "unchanged") {
    return ratingsOf(session, isRecord(expected) ? Object.keys(expected) : []);
  }
  const names = [...session.accounts.keys()];
  const isUnchanged = names.every(
    (name) =>
      JSON.stringify(session.records.ratingOf(session.identityNamed(name).playerId)) ===
      JSON.stringify(givenRowOf(session, name)),
  );
  return isUnchanged ? "unchanged" : ratingsOf(session, names);
}
