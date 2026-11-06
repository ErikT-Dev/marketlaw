import type { DrawAsked } from "../../../shared/DrawAsked";
import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import type { IconText } from "../../components/IconText";
import type { IconTextPart } from "../../components/IconTextPart";
import { counted } from "./counted";
import type { DrawLogRow } from "./DrawLogRow";
import { playerNameOf } from "./playerNameOf";

const CAUSE_TEXT: Readonly<Record<Extract<DrawLogEntry, { kind: "draw" }>["cause"], IconTextPart>> =
  {
    income: { stat: "income" },
    project: "project",
    quest: "quest",
    draw_action: "draw action",
  };

function askedWhat(asked: DrawAsked): string {
  return asked.by === "sector" ? asked.sector : asked.kind.replace(/ card$/, "");
}

function askedText(asked: DrawAsked): string {
  return `${askedWhat(asked)}, tier ${String(asked.tier)}`;
}

function marketGoDrewText(row: DrawLogRow, asked: DrawAsked): string {
  const drawn = row.flatMap((entry) =>
    entry.kind === "turn_draw" && entry.count > 0 ? [entry] : [],
  );
  const total = drawn.reduce((sum, entry) => sum + entry.count, 0);
  const [only, ...others] = drawn;
  if (only === undefined) {
    return "drew no cards";
  }
  if (others.length === 0) {
    return `drew ${counted(total, "card")}: ${askedText(only.asked)}`;
  }
  const tiers = drawn.map((entry) => `${String(entry.count)} of tier ${String(entry.asked.tier)}`);
  return `drew ${counted(total, "card")}: ${askedWhat(asked)}, ${tiers.join(" and ")}`;
}

export function drawLogText(row: DrawLogRow, playerNames: ReadonlyArray<string>): IconText {
  const [entry] = row;
  if (entry.kind === "turn_draw") {
    const name = playerNameOf(playerNames, entry.seat);
    const drew = marketGoDrewText(row, entry.asked);
    return entry.choice.option === "A"
      ? `${name} took ${entry.choice.card} from the marketplace and ${drew}`
      : `${name} skipped the marketplace and ${drew}`;
  }
  if (entry.kind === "draw") {
    const name = playerNameOf(playerNames, entry.seat);
    return [
      `${name} drew ${counted(entry.count, "card")}: ${askedText(entry.asked)} (`,
      CAUSE_TEXT[entry.cause],
      ")",
    ];
  }
  const shuffle = entry.seat === null ? "Discard shuffle for the marketplace" : "Discard shuffle";
  if (entry.asked === null) {
    return `${shuffle}: the whole discard pile, ${counted(entry.count, "card")}, went into the deck`;
  }
  return `${shuffle}: ${String(entry.count)} ${askedText(entry.asked)} ${entry.count === 1 ? "card" : "cards"} went into the deck`;
}
