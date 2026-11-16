import * as v from "valibot";
import { EpochMs } from "../EpochMs";
import { RANKED_GAME_SIZES } from "../RANKED_GAME_SIZES";
import { ReasonCode } from "../ReasonCode";
import { RoomCode } from "../RoomCode";

const SIZE = v.picklist(RANKED_GAME_SIZES);
const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));
const DAILY_LIMIT = v.picklist(["daily_action_limit", "daily_game_start_limit"]);
const VERSIONED = { protocolVersion: v.number() };

const QUEUE_VIEW_SCHEMA = v.object({
  counts: v.object({ total: COUNT, bySize: v.object({ 2: COUNT, 3: COUNT, 4: COUNT }) }),
  own: v.variant("kind", [
    v.object({
      kind: v.literal("out"),
      rejoinAt: v.nullable(EpochMs),
      dailyLimit: v.nullable(DAILY_LIMIT),
    }),
    v.object({ kind: v.literal("waiting"), sizes: v.array(SIZE) }),
    v.object({
      kind: v.literal("confirming"),
      size: SIZE,
      deadline: EpochMs,
      isConfirmed: v.boolean(),
    }),
  ]),
  isSiteGameLimitReached: v.boolean(),
});

const QUEUE_NOTICE_SCHEMA = v.variant("kind", [
  v.object({ kind: v.literal("match_found"), size: SIZE }),
  v.object({ kind: v.literal("match_started"), code: RoomCode }),
  v.object({
    kind: v.literal("match_not_started"),
    reason: v.picklist(["not_confirmed", "player_daily_limit", "no_room"]),
  }),
  v.object({ kind: v.literal("match_missed"), rejoinAt: EpochMs }),
  v.object({ kind: v.literal("site_game_limit") }),
  v.object({ kind: v.literal("daily_limit"), reason: DAILY_LIMIT }),
]);

export const QUEUE_SERVER_MESSAGE_SCHEMA = v.variant("type", [
  v.object({ ...VERSIONED, type: v.literal("queue"), queue: QUEUE_VIEW_SCHEMA }),
  v.object({ ...VERSIONED, type: v.literal("queue_notice"), notice: QUEUE_NOTICE_SCHEMA }),
  v.object({ ...VERSIONED, type: v.literal("queue_rejected"), code: ReasonCode }),
]);
