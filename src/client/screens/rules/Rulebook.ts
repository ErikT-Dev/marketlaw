import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookSection } from "./RulebookSection";
import type { RulebookSectionRef } from "./RulebookSectionRef";

export type Rulebook = {
  readonly title: string;
  readonly introduction: ReadonlyArray<RulebookBlock>;
  readonly contents: ReadonlyArray<RulebookSectionRef>;
  readonly sections: ReadonlyArray<RulebookSection>;
};
