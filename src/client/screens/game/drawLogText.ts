import type { DrawAsked } from "../../../shared/DrawAsked";
import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import { counted } from "./counted";
import { playerNameOf } from "./playerNameOf";

const CAUSE_TEXT: Readonly<Record<Extract<DrawLogEntry, { kind: "draw" }>["cause"], string>> = {
  income: "income",
  project: "project",
  draw_action: "draw action",
};

function askedText(asked: DrawAsked): string {
  const what = asked.by === "sector" ? asked.sector : asked.kind.replace(/ card$/, "");
  return `${what}, tier ${String(asked.tier)}`;
}

export function drawLogText(entry: DrawLogEntry, playerNames: ReadonlyArray<string>): string {
  if (entry.kind === "turn_draw") {
    const name = playerNameOf(playerNames, entry.seat);
    const drew = `drew ${counted(entry.count, "card")}: ${askedText(entry.asked)}`;
    return entry.choice.option === "A"
      ? `${name} took ${entry.choice.card} from the marketplace and ${drew}`
      : `${name} skipped the marketplace and ${drew}`;
  }
  if (entry.kind === "draw") {
    const name = playerNameOf(playerNames, entry.seat);
    return `${name} drew ${counted(entry.count, "card")}: ${askedText(entry.asked)} (${CAUSE_TEXT[entry.cause]})`;
  }
  const shuffle = entry.seat === null ? "Discard shuffle for the marketplace" : "Discard shuffle";
  if (entry.asked === null) {
    return `${shuffle}: the whole discard pile, ${counted(entry.count, "card")}, went into the deck`;
  }
  return `${shuffle}: ${String(entry.count)} ${askedText(entry.asked)} ${entry.count === 1 ? "card" : "cards"} went into the deck`;
}
