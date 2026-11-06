import { useId, type ReactNode } from "react";
import styles from "./Panel.module.css";
import { useIsScrollable } from "./useIsScrollable";

type Props = {
  readonly title: string;
  readonly children?: ReactNode;
  readonly aside?: ReactNode;
  readonly help?: ReactNode;
};

export function Panel({ title, children, aside, help }: Props) {
  const titleId = useId();
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  const heading = (
    <h2 id={titleId} className={styles["title"]}>
      {title}
    </h2>
  );
  return (
    <section className={styles["panel"]} aria-labelledby={titleId}>
      <div className={styles["header"]}>
        {help === undefined ? (
          heading
        ) : (
          <div className={styles["titleWithHelp"]}>
            {heading}
            {help}
          </div>
        )}
        {aside}
      </div>
      <div
        ref={scrollerRef}
        className={styles["body"]}
        role="group"
        aria-labelledby={titleId}
        tabIndex={isScrollable ? 0 : undefined}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
}
