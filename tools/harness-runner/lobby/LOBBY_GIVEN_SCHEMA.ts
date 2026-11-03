import * as v from "valibot";

export const LOBBY_GIVEN_SCHEMA = v.strictObject({
  accounts: v.optional(
    v.array(
      v.strictObject({
        name: v.string(),
        kind: v.optional(v.literal("guest")),
        last_used_ms: v.optional(v.number()),
      }),
    ),
  ),
  room: v.optional(
    v.strictObject({
      code: v.string(),
      size: v.picklist([2, 3, 4]),
      public: v.boolean(),
      owner: v.string(),
      players: v.array(v.string()),
      state: v.picklist(["waiting", "accepting", "playing"]),
    }),
  ),
});

export type LobbyGiven = v.InferOutput<typeof LOBBY_GIVEN_SCHEMA>;
