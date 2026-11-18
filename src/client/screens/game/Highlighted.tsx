import { useContext, type ReactNode } from "react";
import { HighlightFrame } from "./HighlightFrame";
import { HighlightedParts } from "./HighlightedParts";
import type { ScreenPart } from "./ScreenPart";
import { screenPartKey } from "./screenPartKey";

type Props = {
  readonly part: ScreenPart;
  readonly isBlock?: boolean;
  readonly children: ReactNode;
};

export function Highlighted({ part, isBlock = false, children }: Props) {
  const highlighted = useContext(HighlightedParts);
  const key = screenPartKey(part);
  if (!highlighted.some((shown) => screenPartKey(shown) === key)) {
    return children;
  }
  return <HighlightFrame isBlock={isBlock}>{children}</HighlightFrame>;
}
