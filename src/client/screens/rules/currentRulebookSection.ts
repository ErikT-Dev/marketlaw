import type { Rulebook } from "./Rulebook";
import type { RulebookSection } from "./RulebookSection";
import type { RulebookSectionRef } from "./RulebookSectionRef";

type CurrentRulebookSection = {
  readonly section: RulebookSection;
  readonly isFirst: boolean;
  readonly previous: RulebookSectionRef | null;
  readonly next: RulebookSectionRef | null;
};

function refOf(section: RulebookSection | undefined): RulebookSectionRef | null {
  return section === undefined ? null : { title: section.title, anchor: section.anchor };
}

export function currentRulebookSection(
  rulebook: Rulebook,
  sectionAnchor: string | null,
): CurrentRulebookSection {
  const index = Math.max(
    0,
    rulebook.sections.findIndex((section) => section.anchor === sectionAnchor),
  );
  const section = rulebook.sections[index];
  if (section === undefined) {
    throw new Error("The rulebook has no sections");
  }
  return {
    section,
    isFirst: index === 0,
    previous: refOf(rulebook.sections[index - 1]),
    next: refOf(rulebook.sections[index + 1]),
  };
}
