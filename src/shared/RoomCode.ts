import * as v from "valibot";

export const RoomCode = v.pipe(
  v.string(),
  v.regex(/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/),
  v.brand("RoomCode"),
);

export type RoomCode = v.InferOutput<typeof RoomCode>;
