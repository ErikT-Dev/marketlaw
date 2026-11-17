import type { RecordReadDatabase } from "../../../src/server/records/RecordReadDatabase.ts";
import type { GameRecordDatabase } from "../../../src/server/records/GameRecordDatabase.ts";
import type { PlayerRatingBeforeGame } from "../../../src/server/ratings/PlayerRatingBeforeGame.ts";
import type { RatingBeforeGame } from "../../../src/server/ratings/RatingBeforeGame.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";

export type MemoryGameRecords = {
  readonly database: GameRecordDatabase;
  readonly reader: RecordReadDatabase;
  readonly rowCounts: () => Readonly<Record<"records" | "players" | "ratings", number>>;
  readonly giveRating: (rating: PlayerRatingBeforeGame) => void;
  readonly ratingOf: (playerId: PlayerId) => RatingBeforeGame | null;
};
