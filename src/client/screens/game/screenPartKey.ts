import type { ScreenPart } from "./ScreenPart";

export function screenPartKey(part: ScreenPart): string {
  switch (part.kind) {
    case "panel":
      return `panel ${part.panel}`;
    case "hand_card":
    case "market_card":
      return `${part.kind} ${part.card}`;
    case "button":
      return `button ${part.button}`;
    case "sector":
      return `sector ${part.sector}`;
    case "quest":
      return `quest ${part.quest}`;
  }
}
