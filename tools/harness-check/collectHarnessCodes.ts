import type { HarnessCodes } from "./HarnessCodes.ts";

const BACKTICKED = /`([^`]+)`/g;

function sectionBetween(text: string, startHeading: string, endHeading: string): string {
  const start = text.indexOf(startHeading);
  const end = text.indexOf(endHeading, start + startHeading.length);
  return start < 0 ? "" : text.slice(start, end < 0 ? undefined : end);
}

const FENCED_BLOCK = /```[\s\S]*?```/g;

function backtickedWords(text: string): ReadonlyArray<string> {
  return [...text.replace(FENCED_BLOCK, "").matchAll(BACKTICKED)].map((match) => match[1] ?? "");
}

function firstColumnWords(tableText: string): ReadonlyArray<string> {
  return tableText
    .split("\n")
    .filter((line) => line.startsWith("| `"))
    .flatMap((line) => backtickedWords(line.split("|")[1] ?? ""));
}

export function collectHarnessCodes(harnessText: string): HarnessCodes {
  const actionsSection = sectionBetween(harnessText, "## Actions", "## Reason codes");
  const tradesStart = actionsSection.indexOf("Influence trades");
  return {
    reasonCodes: new Set(
      firstColumnWords(sectionBetween(harnessText, "## Reason codes", "## What passing means")),
    ),
    actions: new Set(firstColumnWords(actionsSection.slice(0, tradesStart))),
    trades: new Set(backtickedWords(actionsSection.slice(tradesStart))),
    documentedWords: new Set(
      backtickedWords(harnessText).flatMap((word) => word.split(/[^a-z0-9_]+/)),
    ),
  };
}
