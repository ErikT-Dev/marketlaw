import { applyTutorialAction } from "../../rules/tutorial/applyTutorialAction";
import { startTutorial } from "../../rules/tutorial/startTutorial";
import type { TutorialState } from "../../rules/tutorial/TutorialState";
import type { EpochMs } from "../../shared/EpochMs";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { TutorialIntent } from "../../shared/protocol/TutorialIntent";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import { gameActionOf } from "../room/gameActionOf";

const TUTORIAL_SEAT = 1;

export function nextTutorialState(
  tutorial: TutorialState,
  intent: ActionIntent | Exclude<TutorialIntent, { readonly type: "leave_tutorial" }>,
  now: EpochMs,
): Result<TutorialState, ReasonCode> {
  if (intent.type === "restart_tutorial") {
    return { isOk: true, value: startTutorial(now) };
  }
  const action = intent.type === "continue" ? intent : gameActionOf(TUTORIAL_SEAT, intent);
  if (action === undefined) {
    return { isOk: false, error: "malformed_message" };
  }
  const applied = applyTutorialAction(tutorial, action, now);
  return applied.isOk ? applied : { isOk: false, error: applied.error.code };
}
