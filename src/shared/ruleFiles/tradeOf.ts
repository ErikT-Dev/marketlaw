import type { Trade } from "../Trade";
import { INFLUENCE_TRADES } from "./INFLUENCE_TRADES";

export function tradeOf(name: string): Trade {
  const trade = INFLUENCE_TRADES.find((candidate) => candidate.name === name);
  if (trade === undefined) {
    throw new Error(`no trade named ${name}`);
  }
  return trade;
}
