import { useEffect, useRef, useState, type RefObject } from "react";

export function useIsScrollable(): {
  readonly scrollerRef: RefObject<HTMLDivElement | null>;
  readonly contentRef: RefObject<HTMLDivElement | null>;
  readonly isScrollable: boolean;
} {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (scroller === null || content === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      setIsScrollable(scroller.scrollHeight > scroller.clientHeight);
    });
    observer.observe(scroller);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { scrollerRef, contentRef, isScrollable };
}
