import type { RefObject } from "react";
import styles from "./Lobby.module.css";

type Props = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly isUnavailable: boolean;
};

export function HumanCheck({ containerRef, isUnavailable }: Props) {
  return (
    <div className={styles["humanCheck"]}>
      <div ref={containerRef} aria-label="Human check" role="group" />
      {isUnavailable ? (
        <p role="alert" className={styles["error"]}>
          The human check could not be loaded. Reload the page and try again.
        </p>
      ) : null}
    </div>
  );
}
