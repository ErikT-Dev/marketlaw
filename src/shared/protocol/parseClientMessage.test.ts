import { describe, expect, it } from "vitest";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";
import { parseClientMessage } from "./parseClientMessage";

function actionMessage(action: Readonly<Record<string, unknown>>): string {
  return JSON.stringify({
    protocolVersion: PROTOCOL_VERSION,
    token: "token",
    type: "action",
    actionId: "a1",
    stateVersion: 0,
    action,
  });
}

describe("parseClientMessage", () => {
  it("reads influence, draw action and undo intents", () => {
    const intents = [
      { type: "influence", trade: "skip_build" },
      { type: "draw_action", kind: "Industry", tier: 2 },
      { type: "undo" },
    ];
    for (const intent of intents) {
      const parsed = parseClientMessage(actionMessage(intent));
      expect(parsed.isOk && parsed.value.type === "action" ? parsed.value.action : null).toEqual(
        intent,
      );
    }
  });

  it("rejects an action type that does not exist as unknown", () => {
    expect(parseClientMessage(actionMessage({ type: "fly" }))).toEqual({
      isOk: false,
      error: "unknown_action",
    });
  });
});
