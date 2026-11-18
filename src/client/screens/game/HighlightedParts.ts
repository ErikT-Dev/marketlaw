import { createContext } from "react";
import type { ScreenPart } from "./ScreenPart";

export const HighlightedParts = createContext<ReadonlyArray<ScreenPart>>([]);
