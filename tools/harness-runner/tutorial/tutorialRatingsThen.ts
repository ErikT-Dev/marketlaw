import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { TutorialSession } from "./TutorialSession.ts";

export function tutorialRatingsThen(session: TutorialSession, expected: unknown): unknown {
  const names = isRecord(expected) ? Object.keys(expected) : [];
  return Object.fromEntries(
    names.map((name) => [
      name,
      session.records.ratingOf(session.identityNamed(name).playerId)?.rating ??
        NEW_PLAYER_RATING.rating,
    ]),
  );
}
