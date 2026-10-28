import * as v from "valibot";
import { GAME_STATE_SCHEMA } from "./GAME_STATE_SCHEMA";

export const TEST_ROOM_REQUEST = v.object({
  state: GAME_STATE_SCHEMA,
  playerNames: v.pipe(
    v.array(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
    v.minLength(1),
    v.maxLength(4),
  ),
});
