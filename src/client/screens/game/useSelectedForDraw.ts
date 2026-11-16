import { useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";

export function useSelectedForDraw(isYourGo: boolean) {
  const [selectedForDraw, setSelectedForDraw] = useState<CardName | null>(null);
  if (!isYourGo && selectedForDraw !== null) {
    setSelectedForDraw(null);
  }
  function selectForDraw(card: CardName) {
    if (isYourGo) {
      setSelectedForDraw(card);
    }
  }
  return { selectedForDraw, selectForDraw };
}
