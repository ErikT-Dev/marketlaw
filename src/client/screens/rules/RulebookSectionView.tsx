import { Fragment } from "react";
import type { RulebookBlock } from "./RulebookBlock";
import { RulebookBlocks } from "./RulebookBlocks";
import type { RulebookSection } from "./RulebookSection";
import type { RulebookSectionRef } from "./RulebookSectionRef";
import { RulebookSectionSteps } from "./RulebookSectionSteps";
import styles from "./Rules.module.css";
import { SectionLink } from "./SectionLink";

type Props = {
  readonly section: RulebookSection;
  readonly introduction: ReadonlyArray<RulebookBlock>;
  readonly previous: RulebookSectionRef | null;
  readonly next: RulebookSectionRef | null;
};

export function RulebookSectionView({ section, introduction, previous, next }: Props) {
  return (
    <article className={styles["section"]} aria-labelledby="rules-section-title">
      <RulebookBlocks blocks={introduction} />
      <h2 id="rules-section-title" className={styles["sectionTitle"]}>
        {section.title}
      </h2>
      <RulebookBlocks blocks={section.blocks} />
      {section.related.length === 0 ? null : (
        <div className={styles["seeAlso"]} role="group" aria-label="See also">
          See also:{" "}
          {section.related.map((related, index) => (
            <Fragment key={related.anchor}>
              {index === 0 ? null : " · "}
              <SectionLink anchor={related.anchor} className={styles["seeAlsoLink"]}>
                {related.title}
              </SectionLink>
            </Fragment>
          ))}
        </div>
      )}
      <RulebookSectionSteps previous={previous} next={next} />
    </article>
  );
}
