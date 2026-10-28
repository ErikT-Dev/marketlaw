import { useId, type ReactNode } from "react";
import styles from "./Panel.module.css";

type Props = {
  readonly title: string;
  readonly children?: ReactNode;
};

export function Panel({ title, children }: Props) {
  const titleId = useId();
  return (
    <section className={styles["panel"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["title"]}>
        {title}
      </h2>
      <div className={styles["body"]}>{children}</div>
    </section>
  );
}
