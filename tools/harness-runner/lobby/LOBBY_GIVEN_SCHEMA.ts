import * as v from "valibot";

const GIVEN_ROOM = v.strictObject({
  code: v.string(),
  size: v.picklist([2, 3, 4]),
  public: v.boolean(),
  owner: v.optional(v.string()),
  players: v.array(v.string()),
  state: v.picklist(["waiting", "accepting", "playing", "ended"]),
  ended_ms: v.optional(v.number()),
});

export const LOBBY_GIVEN_SCHEMA = v.strictObject({
  clock_ms: v.optional(v.number()),
  site_games_today: v.optional(v.number()),
  accounts: v.optional(
    v.array(
      v.strictObject({
        name: v.string(),
        kind: v.optional(v.literal("guest")),
        last_used_ms: v.optional(v.number()),
        actions_today: v.optional(v.number()),
        games_started_today: v.optional(v.number()),
      }),
    ),
  ),
  room: v.optional(GIVEN_ROOM),
  other_rooms: v.optional(v.array(GIVEN_ROOM)),
});

export type LobbyGiven = v.InferOutput<typeof LOBBY_GIVEN_SCHEMA>;
