import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookSectionRef } from "./RulebookSectionRef";

export type RulebookSection = {
  readonly title: string;
  readonly anchor: string;
  readonly blocks: ReadonlyArray<RulebookBlock>;
  readonly related: ReadonlyArray<RulebookSectionRef>;
};
