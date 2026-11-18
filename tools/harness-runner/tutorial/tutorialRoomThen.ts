import type { TutorialSession } from "./TutorialSession.ts";

export function tutorialRoomThen(session: TutorialSession, field: string): unknown {
  const { record } = session;
  const stage = record?.tutorial.stage;
  switch (field) {
    case "tutorial_step":
      return stage;
    case "tutorial":
      return stage === "complete" ? "ended" : stage;
    default:
      return record === undefined ? "deleted" : { seats: 1, player: record.player.name };
  }
}
