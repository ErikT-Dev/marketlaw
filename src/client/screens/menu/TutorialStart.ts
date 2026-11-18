import { createContext } from "react";

export const TutorialStart = createContext<(() => void) | null>(null);
