import type { DrawAsked } from "../../../shared/DrawAsked";
import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import { counted } from "./counted";
import { playerNameOf } from "./playerNameOf";

const CAUSE_TEXT: Readonly<Record<Extract<DrawLogEntry, { kind: "draw" }>["cause"], string>> = {
  income: "income",
};

function askedText(asked: DrawAsked): string {
  const what = asked.by === "sector" ? asked.sector : asked.kind.replace(/ card$/, "");
  return `${what}, tier ${String(asked.tier)}`;
}

export function drawLogText(entry: DrawLogEntry, playerNames: ReadonlyArray<string>): string {
  if (entry.kind === "draw") {
    const name = playerNameOf(playerNames, entry.seat);
    return `${name} drew ${counted(entry.count, "card")}: ${askedText(entry.asked)} (${CAUSE_TEXT[entry.cause]})`;
  }
  if (entry.asked === null) {
    return `Discard shuffle: the whole discard pile, ${counted(entry.count, "card")}, went into the deck`;
  }
  return `Discard shuffle: ${String(entry.count)} ${askedText(entry.asked)} ${entry.count === 1 ? "card" : "cards"} went into the deck`;
}
