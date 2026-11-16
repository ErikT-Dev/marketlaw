import * as v from "valibot";
import { SessionToken } from "../api/SessionToken";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";

const ENVELOPE = {
  protocolVersion: v.literal(PROTOCOL_VERSION),
  token: SessionToken,
};

const SIZES = v.pipe(v.array(v.pipe(v.number(), v.integer())), v.maxLength(3));

export const QueueClientMessage = v.variant("type", [
  v.strictObject({ ...ENVELOPE, type: v.literal("resync") }),
  v.strictObject({ ...ENVELOPE, type: v.literal("join_queue"), sizes: v.nullable(SIZES) }),
  v.strictObject({ ...ENVELOPE, type: v.literal("change_sizes"), sizes: SIZES }),
  v.strictObject({ ...ENVELOPE, type: v.literal("leave_queue") }),
  v.strictObject({ ...ENVELOPE, type: v.literal("confirm_match") }),
  v.strictObject({ ...ENVELOPE, type: v.literal("decline_match") }),
]);

export type QueueClientMessage = v.InferOutput<typeof QueueClientMessage>;
