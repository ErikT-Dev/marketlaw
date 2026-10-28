import type { Kind } from "../shared/catalogue/Kind";
import type { OwnSeatView } from "../shared/OwnSeatView";
import { PROJECT_NAMES } from "../shared/PROJECT_NAMES";
import type { ProjectName } from "../shared/ProjectName";

const KIND_RAISING: Readonly<Record<ProjectName, Kind>> = {
  quality: "Public quality card",
  satisfaction: "Public satisfaction card",
  workforce: "Residential",
};

export function projectKindWanted(seat: OwnSeatView): Kind | undefined {
  const closest = PROJECT_NAMES.filter((project) => !seat.projects.includes(project)).reduce<
    ProjectName | undefined
  >(
    (best, project) =>
      best === undefined || seat.stats[project] > seat.stats[best] ? project : best,
    undefined,
  );
  return closest === undefined ? undefined : KIND_RAISING[closest];
}
