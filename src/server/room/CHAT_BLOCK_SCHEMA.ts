import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";

const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));

export const CHAT_BLOCK_SCHEMA = v.object({
  messages: v.array(v.object({ from: PlayerId, name: v.string(), text: v.string(), at: EpochMs })),
  quota: v.object({ day: COUNT, left: COUNT }),
});
