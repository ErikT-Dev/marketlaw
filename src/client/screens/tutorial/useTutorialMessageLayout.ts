import { useLayoutEffect, useState, type RefObject } from "react";
import type { ScreenRect } from "./ScreenRect";
import type { TutorialMessageLayout } from "./TutorialMessageLayout";
import { tutorialMessagePlacementOf } from "./tutorialMessagePlacementOf";

function rectOf(element: Element): ScreenRect {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return { left, top, right, bottom };
}

function unionOf(rects: ReadonlyArray<ScreenRect>): ScreenRect | null {
  if (rects.length === 0) {
    return null;
  }
  return {
    left: Math.min(...rects.map((rect) => rect.left)),
    top: Math.min(...rects.map((rect) => rect.top)),
    right: Math.max(...rects.map((rect) => rect.right)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
  };
}

function measuredLayout(box: HTMLElement): TutorialMessageLayout {
  const table = box.closest("main");
  const column = box.parentElement;
  if (table === null || column === null) {
    return { placement: null, highlighted: [] };
  }
  const frames = [...table.querySelectorAll("[data-highlight-frame]")];
  const highlighted = frames.map(rectOf);
  const union = unionOf(highlighted);
  const highlightedColumn = frames[0]?.closest("[data-tutorial-column] > *") ?? null;
  const bigCard = table.querySelector("[data-big-card]");
  const placement =
    union === null
      ? null
      : tutorialMessagePlacementOf({
          highlighted: union,
          highlightedColumn: highlightedColumn === null ? union : rectOf(highlightedColumn),
          column: rectOf(column),
          table: rectOf(table),
          bigCard: bigCard === null ? null : rectOf(bigCard),
          boxHeight: box.offsetHeight,
          windowHeight: window.innerHeight,
        });
  return { placement, highlighted };
}

function watchedElementsOf(table: HTMLElement, box: HTMLElement): ReadonlyArray<Element> {
  const column = box.parentElement;
  return [
    table,
    box,
    ...(column === null ? [] : [column]),
    ...table.querySelectorAll("[data-highlight-frame], [data-big-card]"),
  ];
}

function watchTable(table: HTMLElement, box: HTMLElement, onChange: () => void): () => void {
  const resizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onChange);
  function watchSizes(): void {
    watchedElementsOf(table, box).forEach((element) => {
      resizes?.observe(element);
    });
  }
  const mutations = new MutationObserver(() => {
    watchSizes();
    onChange();
  });
  mutations.observe(table, { childList: true, subtree: true });
  watchSizes();
  window.addEventListener("resize", onChange);
  window.addEventListener("scroll", onChange, true);
  return () => {
    mutations.disconnect();
    resizes?.disconnect();
    window.removeEventListener("resize", onChange);
    window.removeEventListener("scroll", onChange, true);
  };
}

export function useTutorialMessageLayout(
  boxRef: RefObject<HTMLElement | null>,
  stepKey: string,
): TutorialMessageLayout | null {
  const [layout, setLayout] = useState<TutorialMessageLayout | null>(null);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const table = box?.closest("main");
    if (box === null || table === null || table === undefined) {
      return undefined;
    }
    let frame = 0;
    function measure(): void {
      if (box === null) {
        return;
      }
      const next = measuredLayout(box);
      setLayout((shown) => (JSON.stringify(shown) === JSON.stringify(next) ? shown : next));
    }
    measure();
    const stopWatching = watchTable(table, box, () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    return () => {
      cancelAnimationFrame(frame);
      stopWatching();
    };
  }, [boxRef, stepKey]);
  return layout;
}
