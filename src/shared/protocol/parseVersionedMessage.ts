import * as v from "valibot";
import type { ReasonCode } from "../ReasonCode";
import type { Result } from "../Result";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";

const VERSIONED = v.looseObject({ protocolVersion: v.number() });

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function parseVersionedMessage<TSchema extends v.GenericSchema>(
  text: string,
  schema: TSchema,
): Result<v.InferOutput<TSchema>, ReasonCode> {
  const json = readJson(text);
  const versioned = v.safeParse(VERSIONED, json);
  if (!versioned.success) {
    return { isOk: false, error: "malformed_message" };
  }
  if (versioned.output.protocolVersion !== PROTOCOL_VERSION) {
    return { isOk: false, error: "wrong_protocol_version" };
  }
  const parsed = v.safeParse(schema, json);
  return parsed.success
    ? { isOk: true, value: parsed.output }
    : { isOk: false, error: "malformed_message" };
}
