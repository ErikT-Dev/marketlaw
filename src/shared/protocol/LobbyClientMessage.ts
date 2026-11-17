import * as v from "valibot";
import { SessionToken } from "../api/SessionToken";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";

export const LobbyClientMessage = v.strictObject({
  protocolVersion: v.literal(PROTOCOL_VERSION),
  type: v.literal("identify"),
  token: SessionToken,
});

export type LobbyClientMessage = v.InferOutput<typeof LobbyClientMessage>;
