import * as v from "valibot";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";
import { ActionIntent } from "./ActionIntent";

const ENVELOPE = {
  protocolVersion: v.literal(PROTOCOL_VERSION),
  token: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
};

export const ClientMessage = v.variant("type", [
  v.strictObject({ ...ENVELOPE, type: v.literal("resync") }),
  v.strictObject({
    ...ENVELOPE,
    type: v.literal("action"),
    actionId: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
    stateVersion: v.pipe(v.number(), v.integer(), v.minValue(0)),
    action: ActionIntent,
  }),
]);

export type ClientMessage = v.InferOutput<typeof ClientMessage>;
