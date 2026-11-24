import type { QuestTurnsLeftLook } from "./QuestTurnsLeftLook";

export function questTurnsLeftLookOf(turnsLeft: number, turnsOnTable: number): QuestTurnsLeftLook {
  if (turnsLeft <= 1) {
    return "last_turn";
  }
  if (turnsLeft >= turnsOnTable) {
    return "full_time";
  }
  return turnsLeft * 2 > turnsOnTable ? "above_half" : "half_or_less";
}
