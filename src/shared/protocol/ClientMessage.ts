import * as v from "valibot";
import { SessionToken } from "../api/SessionToken";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";
import { ActionIntent } from "./ActionIntent";
import { RoomIntent } from "./RoomIntent";

const ENVELOPE = {
  protocolVersion: v.literal(PROTOCOL_VERSION),
  token: SessionToken,
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
  v.strictObject({ ...ENVELOPE, type: v.literal("room"), action: RoomIntent }),
]);

export type ClientMessage = v.InferOutput<typeof ClientMessage>;
