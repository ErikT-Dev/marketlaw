import type { MouseEvent, ReactNode } from "react";
import { openRulesSection } from "./openRulesSection";
import { rulesSectionHash } from "./rulesSectionHash";

type Props = {
  readonly anchor: string;
  readonly className?: string | undefined;
  readonly isCurrent?: boolean;
  readonly children: ReactNode;
};

function opensInPlace(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

export function SectionLink({ anchor, className, isCurrent = false, children }: Props) {
  return (
    <a
      className={className}
      href={new URL(rulesSectionHash(anchor), window.location.href).href}
      aria-current={isCurrent ? "page" : undefined}
      onClick={(event) => {
        if (opensInPlace(event)) {
          event.preventDefault();
          openRulesSection(anchor);
        }
      }}
    >
      {children}
    </a>
  );
}
