import influenceActionFileText from "../../../harness/spec/influence-actions.txt?raw";
import { contentsOfRuleFile } from "./contentsOfRuleFile";
import type { InfluenceAction } from "./InfluenceAction";
import { readInfluenceActionFile } from "./readInfluenceActionFile";

export const INFLUENCE_ACTIONS: ReadonlyArray<InfluenceAction> = contentsOfRuleFile(
  "influence-actions.txt",
  readInfluenceActionFile(influenceActionFileText),
);
