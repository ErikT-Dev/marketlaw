import type { ProjectName } from "./ProjectName";

export type NegativeStat = {
  readonly stat: ProjectName;
  readonly value: number;
};
