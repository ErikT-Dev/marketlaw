import * as v from "valibot";
import { QuestName } from "../catalogue/QuestName";
import { ReasonCode } from "../ReasonCode";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";

const COUNT = v.pipe(v.number(), v.integer());

export const QUEST_PLACE_VIEW_SCHEMA = v.union([
  v.object({ quest: v.null() }),
  v.object({
    quest: QuestName,
    turnsOnTable: COUNT,
    completeRejection: v.nullable(ReasonCode),
    progress: v.array(
      v.object({ seat: SEAT_NUMBER_SCHEMA, isCompleted: v.boolean(), have: v.array(COUNT) }),
    ),
  }),
]);
