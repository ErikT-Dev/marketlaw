import * as v from "valibot";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";

export const GAME_RESULT_SCHEMA = v.object({
  endedBy: v.picklist([
    "end_goal",
    "turn_limit",
    "last_player",
    "everyone_left",
    "paused_too_long",
    "abandoned_by_vote",
  ]),
  places: v.array(
    v.object({
      seat: SEAT_NUMBER_SCHEMA,
      score: v.number(),
      scorePartsInHundredths: v.object({
        income: v.number(),
        workforce: v.number(),
        quality: v.number(),
        satisfaction: v.number(),
        product: v.number(),
        distribution: v.number(),
        fundsAndHand: v.number(),
        bonusTypes: v.number(),
      }),
      bonusTypePoints: v.number(),
      leftInTurn: v.nullable(v.number()),
      hasReachedEndGoal: v.boolean(),
      income: v.number(),
      fundsAndHand: v.number(),
    }),
  ),
});
