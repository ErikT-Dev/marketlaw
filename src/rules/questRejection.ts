import type { QuestName } from "../shared/catalogue/QuestName";
import { QUEST_TERMS } from "../shared/catalogue/QUEST_TERMS";
import type { ReasonCode } from "../shared/ReasonCode";
import type { GameState } from "./GameState";
import { questNeedHave } from "./questNeedHave";
import type { SeatState } from "./SeatState";

export function questRejection(
  state: GameState,
  seat: SeatState,
  quest: QuestName,
): ReasonCode | undefined {
  if (!state.quests.some((place) => place.quest === quest)) {
    return "quest_not_on_table";
  }
  if (seat.questsCompleted.includes(quest)) {
    return "quest_already_completed";
  }
  const isMet = QUEST_TERMS[quest].needs.every((need) => questNeedHave(seat, need) >= need.count);
  return isMet ? undefined : "quest_needs_not_met";
}
