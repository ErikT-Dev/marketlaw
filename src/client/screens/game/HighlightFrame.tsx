import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Highlighted.module.css";

type Props = {
  readonly isBlock: boolean;
  readonly children: ReactNode;
};

export function HighlightFrame({ isBlock, children }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = frameRef.current;
    if (frame !== null && "scrollIntoView" in frame) {
      frame.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, []);
  return (
    <div
      ref={frameRef}
      className={styles[isBlock ? "block" : "inline"]}
      data-testid="tutorial-highlight"
    >
      {children}
    </div>
  );
}
