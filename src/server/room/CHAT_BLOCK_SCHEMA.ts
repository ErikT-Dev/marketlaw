import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";

export const CHAT_BLOCK_SCHEMA = v.object({
  messages: v.array(v.object({ from: PlayerId, name: v.string(), text: v.string(), at: EpochMs })),
});
