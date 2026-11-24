import type { ScreenRect } from "./ScreenRect";
import type { TutorialMessagePlacement } from "./TutorialMessagePlacement";
import type { TutorialPlacementInput } from "./TutorialPlacementInput";

const EDGE_PX = 8;
const ARROW_LENGTH_PX = 28;
const HIGHLIGHT_OUTLINE_PX = 6;
const ARROW_INSET_PX = 20;

function isLeftOfAndBeside(
  bigCard: ScreenRect,
  highlighted: ScreenRect,
  top: number,
  bottom: number,
): boolean {
  return bigCard.right <= highlighted.left + 1 && bigCard.top < bottom && bigCard.bottom > top;
}

export function tutorialMessagePlacementOf(
  input: TutorialPlacementInput,
): TutorialMessagePlacement {
  const { highlighted, highlightedColumn, column, table, bigCard, boxHeight, windowHeight } = input;
  const boxWidth = column.right - column.left;
  const middleY = (highlighted.top + highlighted.bottom) / 2;
  const lowestTop = windowHeight - EDGE_PX - boxHeight;
  const boxTop = Math.max(table.top, Math.min(middleY - boxHeight / 2, lowestTop));
  const boxBottom = boxTop + boxHeight;
  const besideHighlighted = Math.min(
    highlighted.left - HIGHLIGHT_OUTLINE_PX,
    highlightedColumn.left,
  );
  const rightLimit =
    bigCard !== null && isLeftOfAndBeside(bigCard, highlighted, boxTop, boxBottom)
      ? Math.min(bigCard.left, besideHighlighted)
      : besideHighlighted;
  const boxLeft = Math.max(EDGE_PX, rightLimit - ARROW_LENGTH_PX - boxWidth);
  return {
    boxLeft,
    boxTop,
    boxWidth,
    arrowLeft: boxLeft + boxWidth,
    arrowRight: highlighted.left - HIGHLIGHT_OUTLINE_PX,
    arrowY: Math.max(boxTop + ARROW_INSET_PX, Math.min(middleY, boxBottom - ARROW_INSET_PX)),
  };
}
