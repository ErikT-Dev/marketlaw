import * as v from "valibot";
import { QuestName } from "../catalogue/QuestName";
import { ProjectName } from "../ProjectName";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";

const SEATS = v.array(SEAT_NUMBER_SCHEMA);

export const LAST_TURN_SCHEMA = v.object({
  quests: v.array(v.object({ quest: QuestName, seats: SEATS, firstCompletionFunds: v.number() })),
  projects: v.array(v.object({ project: ProjectName, seats: SEATS })),
  incomeGains: v.array(v.object({ seat: SEAT_NUMBER_SCHEMA, income: v.number() })),
  support: v.array(v.object({ seat: SEAT_NUMBER_SCHEMA, funds: v.number() })),
});
