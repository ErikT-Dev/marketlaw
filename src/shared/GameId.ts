import * as v from "valibot";

export const GameId = v.pipe(v.string(), v.uuid(), v.brand("GameId"));

export type GameId = v.InferOutput<typeof GameId>;
