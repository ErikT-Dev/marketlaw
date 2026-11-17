import * as v from "valibot";

export const ROOM_GIVEN_SCHEMA = v.looseObject({
  room: v.optional(
    v.strictObject({
      code: v.optional(v.string()),
      size: v.optional(v.picklist([2, 3, 4])),
      public: v.optional(v.boolean()),
      owner: v.optional(v.string()),
      players: v.optional(v.array(v.string())),
      state: v.optional(v.picklist(["playing"])),
    }),
  ),
  accounts: v.optional(
    v.array(
      v.strictObject({
        name: v.string(),
        kind: v.optional(v.picklist(["guest", "registered"])),
        rating: v.optional(v.number()),
        ranked_games: v.optional(v.number()),
        highest_rating: v.optional(v.number()),
      }),
    ),
  ),
  seats: v.optional(
    v.array(
      v.looseObject({
        seat: v.number(),
        state_version: v.optional(v.number()),
        connected: v.optional(v.boolean()),
        player: v.optional(v.string()),
      }),
    ),
  ),
});
