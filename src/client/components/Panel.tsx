import { useId, type ReactNode } from "react";
import styles from "./Panel.module.css";
import { useIsScrollable } from "./useIsScrollable";

type Props = {
  readonly title: string;
  readonly children?: ReactNode;
};

export function Panel({ title, children }: Props) {
  const titleId = useId();
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  return (
    <section className={styles["panel"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["title"]}>
        {title}
      </h2>
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
