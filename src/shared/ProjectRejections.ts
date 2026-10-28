import type { ProjectName } from "./ProjectName";
import type { ReasonCode } from "./ReasonCode";

export type ProjectRejections = Readonly<Record<ProjectName, ReasonCode | null>>;
