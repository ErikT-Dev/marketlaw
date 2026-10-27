import * as v from "valibot";

export const QuestName = v.pipe(v.string(), v.minLength(1), v.brand("QuestName"));

export type QuestName = v.InferOutput<typeof QuestName>;
