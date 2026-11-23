import * as v from "valibot";
import { GIVEN_ICON } from "./GIVEN_ICON.ts";
import { TUTORIAL_STEP_IDS } from "../../../src/shared/TUTORIAL_STEP_IDS.ts";

const GIVEN_ROOM = v.strictObject({
  code: v.string(),
  size: v.picklist([2, 3, 4]),
  public: v.boolean(),
  owner: v.optional(v.string()),
  players: v.array(v.string()),
  state: v.picklist(["waiting", "accepting", "playing", "ended"]),
  ended_ms: v.optional(v.number()),
  kind: v.optional(v.picklist(["casual", "ranked"])),
  chat: v.optional(v.array(v.strictObject({ from: v.string(), text: v.string() }))),
  messages_sent: v.optional(v.record(v.string(), v.number())),
  icons: v.optional(v.record(v.string(), GIVEN_ICON)),
});

const GIVEN_RECORD = v.strictObject({
  date: v.string(),
  turns: v.number(),
  players: v.array(
    v.strictObject({
      username: v.string(),
      place: v.number(),
      score: v.number(),
      result: v.picklist(["won", "lost", "left"]),
    }),
  ),
});

export const LOBBY_GIVEN_SCHEMA = v.strictObject({
  clock_ms: v.optional(v.number()),
  site_games_today: v.optional(v.number()),
  site_counts_today: v.optional(
    v.strictObject({
      tutorials: v.optional(v.number()),
      chat_messages: v.optional(v.number()),
      emails: v.optional(v.number()),
    }),
  ),
  email_counts: v.optional(v.record(v.string(), v.number())),
  players: v.optional(v.picklist([2, 3, 4])),
  seats: v.optional(
    v.array(
      v.strictObject({
        seat: v.number(),
        player: v.string(),
        actions_this_game: v.optional(v.number()),
      }),
    ),
  ),
  accounts: v.optional(
    v.array(
      v.strictObject({
        name: v.string(),
        kind: v.optional(v.picklist(["guest", "registered"])),
        email: v.optional(v.nullable(v.string())),
        email_confirmed: v.optional(v.boolean()),
        password: v.optional(v.string()),
        last_used_ms: v.optional(v.number()),
        username_changes_ms: v.optional(v.array(v.number())),
        icon: v.optional(GIVEN_ICON),
        icon_changes_ms: v.optional(v.array(v.number())),
        actions_today: v.optional(v.number()),
        games_started_today: v.optional(v.number()),
        emails_today: v.optional(v.number()),
        games: v.optional(v.number()),
        rating: v.optional(v.number()),
        ranked_games: v.optional(v.number()),
        ranking_place: v.optional(v.number()),
        online: v.optional(v.boolean()),
        in_game: v.optional(v.boolean()),
      }),
    ),
  ),
  room: v.optional(GIVEN_ROOM),
  tutorial: v.optional(v.strictObject({ player: v.string(), step: v.picklist(TUTORIAL_STEP_IDS) })),
  other_rooms: v.optional(v.array(GIVEN_ROOM)),
  records: v.optional(v.array(GIVEN_RECORD)),
  ranked_accounts: v.optional(v.number()),
  queue_count: v.optional(v.number()),
  queue: v.optional(
    v.array(
      v.union([
        v.string(),
        v.strictObject({ player: v.string(), sizes: v.array(v.picklist([2, 3, 4])) }),
      ]),
    ),
  ),
  match: v.optional(
    v.strictObject({
      players: v.array(v.string()),
      size: v.picklist([2, 3, 4]),
      state: v.literal("confirming"),
    }),
  ),
});

export type LobbyGiven = v.InferOutput<typeof LOBBY_GIVEN_SCHEMA>;
