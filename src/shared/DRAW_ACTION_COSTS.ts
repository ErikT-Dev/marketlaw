import type { Tier } from "./catalogue/Tier";

export const DRAW_ACTION_COSTS: Readonly<Record<Tier, number>> = { 1: 3, 2: 4, 3: 5 };
