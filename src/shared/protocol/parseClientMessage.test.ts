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

function roomMessage(action: Readonly<Record<string, unknown>>): string {
  return JSON.stringify({
    protocolVersion: PROTOCOL_VERSION,
    token: "token",
    type: "room",
    action,
  });
}

describe("parseClientMessage", () => {
  it("reads influence, quest, draw action and undo intents", () => {
    const intents = [
      { type: "influence", trade: "skip_build" },
      { type: "complete_quest", quest: "Trading post" },
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

  it("rejects malformed influence, quest, draw action and undo intents as malformed", () => {
    const intents = [
      { type: "influence", trade: "steal" },
      { type: "influence" },
      { type: "complete_quest", quest: "Atlantis" },
      { type: "complete_quest" },
      { type: "complete_quest", quest: "Trading post", seat: 2 },
      { type: "draw_action", kind: "Industry", tier: 4 },
      { type: "draw_action", kind: "Dragons", tier: 1 },
      { type: "draw_action", kind: "Industry", tier: 1, count: 3 },
      { type: "undo", steps: 2 },
    ];
    for (const intent of intents) {
      expect(parseClientMessage(actionMessage(intent))).toEqual({
        isOk: false,
        error: "malformed_message",
      });
    }
  });

  it("reads chat and mute intents and rejects a chat text over 4000 characters as malformed", () => {
    const intents = [
      { type: "send_chat", text: "hello mayors" },
      { type: "mute", playerName: "Bea" },
      { type: "unmute", playerName: "Bea" },
    ];
    for (const intent of intents) {
      const parsed = parseClientMessage(roomMessage(intent));
      expect(parsed.isOk && parsed.value.type === "room" ? parsed.value.action : null).toEqual(
        intent,
      );
    }
    expect(parseClientMessage(roomMessage({ type: "send_chat", text: "a".repeat(4001) }))).toEqual({
      isOk: false,
      error: "malformed_message",
    });
  });
});
