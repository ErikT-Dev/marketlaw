import * as v from "valibot";
import { SessionToken } from "../api/SessionToken";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";
import { ActionIntent } from "./ActionIntent";
import { TutorialIntent } from "./TutorialIntent";

const ENVELOPE = {
  protocolVersion: v.literal(PROTOCOL_VERSION),
  token: SessionToken,
};

const ACTION_ENVELOPE = {
  ...ENVELOPE,
  actionId: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  stateVersion: v.pipe(v.number(), v.integer(), v.minValue(0)),
};

export const TutorialClientMessage = v.variant("type", [
  v.strictObject({ ...ENVELOPE, type: v.literal("resync") }),
  v.strictObject({ ...ACTION_ENVELOPE, type: v.literal("action"), action: ActionIntent }),
  v.strictObject({ ...ACTION_ENVELOPE, type: v.literal("tutorial"), action: TutorialIntent }),
]);

export type TutorialClientMessage = v.InferOutput<typeof TutorialClientMessage>;
