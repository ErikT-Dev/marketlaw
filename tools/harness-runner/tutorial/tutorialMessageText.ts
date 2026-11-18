import type { TutorialAction } from "../../../src/rules/tutorial/TutorialAction.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";

type MessageEnvelope = {
  readonly token: string;
  readonly actionId: string;
  readonly stateVersion: number;
};

function bodyOf(
  action: TutorialAction | { readonly type: "leave_tutorial" },
): Readonly<Record<string, unknown>> {
  if (action.type === "continue" || action.type === "leave_tutorial") {
    return { type: "tutorial", action };
  }
  const intent = Object.fromEntries(Object.entries(action).filter(([field]) => field !== "seat"));
  return { type: "action", action: intent };
}

export function tutorialMessageText(
  action: TutorialAction | { readonly type: "leave_tutorial" },
  envelope: MessageEnvelope,
): string {
  return JSON.stringify({ protocolVersion: PROTOCOL_VERSION, ...envelope, ...bodyOf(action) });
}
