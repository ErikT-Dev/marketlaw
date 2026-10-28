import { useId, type ReactNode } from "react";
import styles from "./Panel.module.css";
import { useIsScrollable } from "./useIsScrollable";

type Props = {
  readonly title: string;
  readonly children?: ReactNode;
  readonly aside?: ReactNode;
};

export function Panel({ title, children, aside }: Props) {
  const titleId = useId();
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  return (
    <section className={styles["panel"]} aria-labelledby={titleId}>
      <div className={styles["header"]}>
        <h2 id={titleId} className={styles["title"]}>
          {title}
        </h2>
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
