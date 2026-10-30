import * as v from "valibot";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";

export const GAME_RESULT_SCHEMA = v.object({
  endedBy: v.picklist(["end_goal", "turn_limit"]),
  places: v.array(
    v.object({
      seat: SEAT_NUMBER_SCHEMA,
      score: v.number(),
      bonusTypePoints: v.number(),
      hasLeft: v.boolean(),
      hasReachedEndGoal: v.boolean(),
      income: v.number(),
      fundsAndHand: v.number(),
    }),
  ),
});
