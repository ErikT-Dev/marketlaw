import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import { PROJECT_TITLES } from "../game/PROJECT_TITLES";

export function projectsText({ projects }: GameRecordSeat): string {
  return projects.length === 0
    ? "none"
    : projects.map((project) => PROJECT_TITLES[project]).join(", ");
}
