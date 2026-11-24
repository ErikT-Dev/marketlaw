import type { ProjectName } from "../../shared/ProjectName";

const PROJECT_PICTURE_FILES: Readonly<Record<ProjectName, string>> = {
  quality: "clean-the-streets",
  satisfaction: "culture-campaign",
  workforce: "help-the-homeless",
};

export function projectPictureUrl(project: ProjectName): string {
  return new URL(`../assets/projects/${PROJECT_PICTURE_FILES[project]}.webp`, import.meta.url).href;
}
